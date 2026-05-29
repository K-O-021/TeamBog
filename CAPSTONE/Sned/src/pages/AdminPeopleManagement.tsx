import React, { useState, useMemo, useEffect } from 'react';

import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Archive,
  Layers3,
  X,
  Save,
  RefreshCcw,
  Plus,
} from 'lucide-react';

import { toast } from 'sonner';
import AdminHeader from '@/components/AdminHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext'; 
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { STORAGE_KEYS } from '@/lib/storageUtils';
import { 
  UserDoc, 
  StudentDoc, 
  addUser, 
  updateUserProfile, 
  archiveUser, 
  addStudent, 
  updateStudent, 
  archiveStudent,
  usersRef,
  studentsRef
} from '@/lib/firestoreQueries';
import { EditTeacherModal } from '@/components/EditTeacherModal';

interface Teacher {
  name: string;
  email: string;
  teacherId: string;
  subject: string;
  role: 'teacher' | 'adviser';
  status?: string;
}

interface Student {
  id: string;
  name: string;
  lrn: string | number;
  parentEmail?: string;
  teacher?: string;
  status?: string;
}

type Person = Teacher | Student;

const AdminPeopleManagement = () => {
  const { 
    users: contextUsers = [], 
    students: contextStudents = [], 
    addUser: contextAddUser, 
    updateUser: contextUpdateUser, 
    archiveUser: contextArchiveUser, 
    addStudent: contextAddStudent, 
    updateStudent: contextUpdateStudent, 
    archiveStudent: contextArchiveStudent,
    isConnected,
    latency 
  } = useApp();

  // Real-time Data States
  const [realTimeTeachers, setRealTimeTeachers] = useState<UserDoc[]>([]);
  const [realTimeStudents, setRealTimeStudents] = useState<StudentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. REAL-TIME LISTENER para sa Teachers
  useEffect(() => {
    const q = query(
      usersRef,
      where("role", "in", ["teacher", "adviser"]),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserDoc[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as UserDoc);
      });
      setRealTimeTeachers(list);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      toast.error("Failed to sync faculty registry.");
    });

    return () => unsubscribe();
  }, []);

  // 2. REAL-TIME LISTENER para sa Students/Parents
  useEffect(() => {
    const q = query(
      studentsRef,
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: StudentDoc[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as StudentDoc);
      });
      setRealTimeStudents(list);
    }, (error) => {
      console.error("Firestore Error Students:", error);
    });

    return () => unsubscribe();
  }, []);


  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // =========================
  // SLIDER
  // =========================
  const [activeSlide, setActiveSlide] = useState(0);

  // =========================
  // MODAL
  // =========================
  const [activeModal, setActiveModal] = useState<
    | 'view'
    | 'edit'
    | 'archive'
    | 'reset'
    | 'addTeacher'
    | 'addParent'
    | null
  >(null);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // =========================
  // TEACHERS
  // =========================
  const teacherWhitelist = useMemo(() => {
    const term = globalSearchTerm.toLowerCase().trim();
    return realTimeTeachers.filter(u => 
      u.status !== 'archived' &&
      (u.name?.toLowerCase().includes(term) ||
       u.email?.toLowerCase().includes(term) ||
       u.teacherId?.toLowerCase().includes(term) ||
       (u.subject?.toLowerCase().includes(term) ?? false))
    );
  }, [realTimeTeachers, globalSearchTerm]);

  // =========================
  // PARENTS
  // =========================
  const parentWhitelist = useMemo(() => {
    const term = globalSearchTerm.toLowerCase().trim();
    return realTimeStudents.filter(s => 
      s.status !== 'archived' &&
      (s.name?.toLowerCase().includes(term) || 
       (s.lrn?.toString().toLowerCase().includes(term) ?? false) ||
       (s.parentEmail?.toLowerCase().includes(term) ?? false))
    );
  }, [realTimeStudents, globalSearchTerm]);

  // =========================
  // FORM STATES
  // =========================
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    role: '',
    subject: '',
    teacherId: '',
  });

  const [parentForm, setParentForm] = useState({
    name: '',
    lrn: '',
    parentEmail: '',
    assignedTeacher: '',
  });

  const [isResetting, setIsResetting] = useState(false);

  // Utility to trigger notifications from Admin to Target Users (Teacher/Parent)
  const triggerAdminNotification = async (targetEmail: string, title: string, body: string) => {
    // Only attempt to send notification if the app is connected
    if (!isConnected) {
      console.warn('Skipping admin notification: App is offline.');
      return;
    }
    try {
      // Fire-and-forget: Huwag i-await para hindi ma-block ang UI kung offline ang backend
      fetch(import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8080/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@sned-link.edu',
          senderRole: 'admin',
          targetEmail,
          title,
          body,
          url: '/settings'
        })
      }).catch((networkError) => { console.warn('Admin notification failed due to network error (backend likely offline):', networkError);
      });
    } catch (error) {
      console.error('Failed to trigger admin notification:', error);
    }
  };

  // =========================
  // OPEN MODAL
  // =========================
  const openModal = (
    type:
      | 'view'
      | 'edit'
      | 'archive'
      | 'reset'
      | 'addTeacher'
      | 'addParent',
    person?: any
  ) => {
    setActiveModal(type);
    const selected = person || null;
    setSelectedPerson(selected);

    if (type === 'edit' && selected) {
      if ('role' in selected) {
        setTeacherForm({
          name: selected.name || '',
          email: selected.email || '',
          role: selected.role || '',
          subject: selected.subject || '',
          teacherId: selected.teacherId || '',
        });
      } else {
        setParentForm({
          name: selected.name || '',
          lrn: selected.lrn?.toString() || '',
          parentEmail: selected.parentEmail || '',
          assignedTeacher: selected.teacher || '',
        });
      }
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    setActiveModal(null);
    setSelectedPerson(null);

    setTeacherForm({
      name: '',
      email: '',
      role: '',
      subject: '',
      teacherId: '',
    });

    setParentForm({
      name: '',
      lrn: '',
      parentEmail: '',
      assignedTeacher: '',
    });
  };

  // =========================
  // ADD TEACHER
  // =========================
  const handleAddTeacher = async () => {
    if (
      !teacherForm.name ||
      !teacherForm.teacherId ||
      !teacherForm.role
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addUser({
      name: teacherForm.name,
      email: teacherForm.email || `${teacherForm.name.toLowerCase().replace(' ', '.')}@sned.edu`,
      teacherId: teacherForm.teacherId.trim().toUpperCase(),
      subject: teacherForm.subject,
      role: teacherForm.role.toLowerCase() as any,
      status: 'active'
      });
      toast.success(`Node Initialized: ${teacherForm.name} added to Faculty Registry`);
      closeModal();
    } catch (err) {
      toast.error("Failed to add teacher to registry.");
    }
  };

  // =========================
  // ADD PARENT
  // =========================
  const handleAddParent = async () => {
    if (!parentForm.name || !parentForm.lrn) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addStudent({
        name: parentForm.name,
        lrn: parentForm.lrn.trim(),
        parentEmail: parentForm.parentEmail,
        teacher: parentForm.assignedTeacher,
        grade: 'Grade 1',
        riskLevel: 'Low',
        status: 'active',
        lastActivity: 'Account Linked'
      });
      toast.success('Learner Protocol Established: Parent LRN Linked');
      closeModal();
    } catch (err) {
      toast.error("Registry Fault: Failed to link parent/student node.");
    }
  };

  // =========================
  // UPDATE ACCOUNT
  // =========================
  const handleUpdate = async () => {
    if (!selectedPerson) return;

    try {
      if ('role' in selectedPerson) {
        const email = (selectedPerson as Teacher).email;
        await updateUserProfile(email, {
          name: teacherForm.name,
          email: teacherForm.email,
          role: teacherForm.role as any,
          subject: teacherForm.subject,
          teacherId: teacherForm.teacherId.trim().toUpperCase(),
        });
        toast.success('Identity Matrix Updated: Teacher record synchronized');
      } else {
        const id = (selectedPerson as Student).id;
        await updateStudent(id, {
          name: parentForm.name, 
          lrn: parentForm.lrn.trim(),
          parentEmail: parentForm.parentEmail,
          teacher: parentForm.assignedTeacher 
        });
        toast.success('Identity Matrix Updated: Student record synchronized');
      }
    } catch (err) {
      toast.error('Sync Error: Failed to update registry node.');
    }

    closeModal();
  };

  // =========================
  // ARCHIVE ACCOUNT
  // =========================
  const handleArchive = async () => {
    if (!selectedPerson) return;

    try {
      if ('role' in selectedPerson) {
        const email = (selectedPerson as Teacher).email;
        await archiveUser(email);
        
        // Hindi na kailangang i-await para mabilis ang UI response
        triggerAdminNotification(
          email,
          'Operational Status Update',
          'Your node clearance has been offloaded to cold storage. Access pipelines are now decoupled.'
        );
        toast.success('Node Decommissioned: Teacher moved to cold storage');
      } else {
        const id = (selectedPerson as Student).id;
        await archiveStudent(id);

        if ((selectedPerson as Student).parentEmail) {
          triggerAdminNotification(
            (selectedPerson as Student).parentEmail!,
            'Archive Protocol',
            'Student data node has been moved to cold storage vault for security.'
          );
        }
        toast.success('File Isolated: Student record moved to vault');
      }
    } catch (err) {
      toast.error('Registry Fault: Failed to archive account.');
    }

    closeModal();
  };

  // =========================
  // SLIDER
  // =========================
  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % 2);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + 2) % 2);
  };

  return (
    <div
      className="space-y-5 min-h-screen p-3 md:p-5"
      style={{
        background: '#FBF7F2',
        fontFamily: "'Times New Roman', serif",
      }}
    >
      {/* HEADER */}
      <AdminHeader
        icon={Users}
        title="People"
        highlightedTitle="Management"
        subtitle="Institutional User Directory"
        showSystemLink
        isConnected={isConnected}
        latency={latency}
      >
        <div className="px-4 py-2 rounded-2xl bg-[#7B1C2A] text-white text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
          Live Stream Active
        </div>
      </AdminHeader>

      {/* SEARCH + EXPORT */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between bg-white p-4 rounded-[2rem] border border-[#d8cfc2] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-4 h-4" />

          <input
            type="text"
            placeholder="Search..."
            value={globalSearchTerm}
            onChange={(e) =>
              setGlobalSearchTerm(e.target.value)
            }
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f8f4ec] text-sm font-bold text-black border border-[#d8cfc2] outline-none"
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-end gap-3">
        <button
          onClick={prevSlide}
          className="p-3 rounded-2xl bg-white border border-[#d8cfc2]"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={nextSlide}
          className="p-3 rounded-2xl bg-[#7B1C2A] text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* PAGES */}
      <AnimatePresence mode="wait">

        {/* PAGE 1 */}
        {activeSlide === 0 && (
          <motion.div
            key="page1"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="bg-white rounded-[2rem] border border-[#d8cfc2] shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-[#d8cfc2]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#7B1C2A] text-white">
                  <Layers3 size={22} />
                </div>

                <div>
                  <h1 className="text-xl font-black uppercase text-black">
                    Teacher Portal Whitelist
                  </h1>

                  <p className="text-xs font-bold text-black">
                    Verified access for Teacher Dashboard
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  openModal('addTeacher')
                }
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-bold"
              >
                <Plus size={16} />
                Add Teacher
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#7B1C2A] text-white">
                  <tr>
                    <th className="p-4 text-left text-[10px] uppercase">
                      #
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">Name</th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Teacher ID
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">Role</th>
                    <th className="p-4 text-left text-[10px] uppercase">Subject</th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Institutional Email
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {teacherWhitelist.map(
                    (teacher, index) => (
                      <tr
                        key={`${teacher.email}-${index}`}
                        className="border-b border-[#d8cfc2] hover:bg-[#f8f4ec]"
                      >
                        <td className="p-4 text-black font-bold">
                          {index + 1}
                        </td>

                        <td className="p-4 text-black font-bold">{teacher.name}</td>

                        <td className="p-4 text-black">{teacher.teacherId}</td>
                        <td className="p-4 text-black uppercase">{teacher.role}</td>
                        <td className="p-4 text-black">
                          {teacher.subject}
                        </td>
                        <td className="p-4 text-black italic text-xs">{teacher.email}</td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black w-fit border border-emerald-100">
                            <motion.div 
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500" 
                            />
                            {teacher.status?.toUpperCase() || 'ACTIVE'}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                openModal(
                                  'view',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-blue-100 text-blue-700"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'edit',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-yellow-100 text-yellow-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'archive',
                                  teacher
                                )
                              }
                              className="p-2 rounded-xl bg-gray-200 text-black"
                            >
                              <Archive size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PAGE 2 */}
        {activeSlide === 1 && (
          <motion.div
            key="page2"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="bg-white rounded-[2rem] border border-[#d8cfc2] shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-[#d8cfc2]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-green-100 text-green-700">
                  <ShieldCheck size={22} className="text-[#7B1C2A]" />
                </div>

                <div>
                  <h1 className="text-xl font-black uppercase text-black">
                    Parent Portal Whitelist
                  </h1>

                  <p className="text-xs font-bold text-black">
                    Verified access for Mobile Application
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  openModal('addParent')
                }
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-bold"
              >
                <Plus size={16} />
                Add Parent
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#7B1C2A] text-white">
                  <tr>
                    <th className="p-4 text-left text-[10px] uppercase">
                      #
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      Student Name
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      LRN
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      Parent Email
                    </th>

                    <th className="p-4 text-left text-[10px] uppercase">
                      Status
                    </th>
                    <th className="p-4 text-left text-[10px] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {parentWhitelist.map(
                    (student, index) => (
                      <tr
                        key={`${student.id}-${index}`}
                        className="border-b border-[#d8cfc2] hover:bg-[#f8f4ec]"
                      >
                        <td className="p-4 font-bold text-black">
                          {index + 1}
                        </td>

                        <td className="p-4 font-bold text-black">
                          {student.name}
                        </td>

                        <td className="p-4 text-black">
                          {student.lrn}
                        </td>

                        <td className="p-4 text-black italic text-xs">
                          {student.parentEmail || 'Not yet linked'}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black w-fit border border-emerald-100">
                            <motion.div 
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500" 
                            />
                            {student.status?.toUpperCase() || 'ACTIVE'}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                openModal(
                                  'view',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-blue-100 text-blue-700"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'edit',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-yellow-100 text-yellow-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                openModal(
                                  'archive',
                                  student
                                )
                              }
                              className="p-2 rounded-xl bg-gray-200 text-black"
                            >
                              <Archive size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white w-full max-w-lg rounded-[2rem] border border-[#d8cfc2] shadow-2xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-5 border-b border-[#d8cfc2]">
                <h1 className="text-xl font-black uppercase text-black">

                  {activeModal === 'addTeacher' &&
                    'Whitelist Teacher'}

                  {activeModal === 'addParent' &&
                    'Whitelist Parent'}

                  {activeModal === 'view' &&
                    'Account Parameters'}

                  {activeModal === 'edit' &&
                    'Modify Matrix'}

                  {activeModal === 'archive' &&
                    'Archive Confirmation'}

                  {activeModal === 'reset' &&
                    'Reset Password'}

                </h1>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl bg-[#f8f4ec]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-4">

                {/* EDIT */}
                {activeModal === 'edit' && (
                  <>
                    {selectedPerson && 'role' in selectedPerson ? (
                      <>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={teacherForm.name}
                          onChange={(e) =>
                            setTeacherForm({
                              ...teacherForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />
                        <input
                          type="text"
                          placeholder="Institutional Email"
                          value={teacherForm.email}
                          onChange={(e) =>
                            setTeacherForm({
                              ...teacherForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                        <select
                          value={teacherForm.role}
                          onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        >
                          <option value="teacher">Teacher</option>
                          <option value="adviser">Adviser</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Subject"
                          value={teacherForm.subject}
                          onChange={(e) =>
                            setTeacherForm({
                              ...teacherForm,
                              subject: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                      <input
                        type="text"
                        placeholder="Teacher ID"
                        value={teacherForm.teacherId}
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            teacherId: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                      />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Student Name"
                          value={parentForm.name}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                        <input
                          type="text"
                          placeholder="LRN"
                          value={parentForm.lrn}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              lrn: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                        <input
                          type="email"
                          placeholder="Parent Email"
                          value={parentForm.parentEmail}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              parentEmail: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                        />

                      <select
                        value={parentForm.assignedTeacher}
                        onChange={(e) => setParentForm({ ...parentForm, assignedTeacher: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                      >
                        <option value="">Assign Teacher/Adviser</option>
                        {contextUsers.filter(u => u.role === 'teacher' || u.role === 'adviser').map(t => (
                          <option key={t.email} value={t.name}>{t.name} ({t.subject})</option>
                        ))}
                      </select>
                      </>
                    )}
                  </>
                )}

                {/* VIEW */}
                {activeModal === 'view' &&
                  selectedPerson && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                        <p className="font-bold text-[10px] uppercase text-slate-400 mb-1">Full Identity Name</p>
                        <p className="font-black text-slate-800">{selectedPerson.name}</p>
                      </div>

                      {'role' in selectedPerson && (
                        <>
                          <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                            <p className="font-bold text-[10px] uppercase text-slate-400 mb-1">Institutional ID</p>
                            <p className="font-black text-slate-800">{(selectedPerson as Teacher).teacherId}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                            <p className="font-bold text-[10px] uppercase text-slate-400 mb-1">Clearance matrix</p>
                            <p className="font-black text-slate-800 uppercase">{(selectedPerson as Teacher).role}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                            <p className="font-bold text-[10px] uppercase text-slate-400 mb-1">Assigned Subject</p>
                            <p className="font-black text-slate-800">{(selectedPerson as Teacher).subject}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                            <p className="font-bold text-[10px] uppercase text-slate-400 mb-1">Datastream Email</p>
                            <p className="font-black text-slate-800">{(selectedPerson as Teacher).email}</p>
                          </div>
                        </>
                      )}

                      {'subject' in selectedPerson && (
                        <div className="p-4 rounded-2xl bg-[#f8f4ec]">
                          <p className="font-bold">
                            Subject
                          </p>
                          <p>
                            {(selectedPerson as Teacher).subject}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* ARCHIVE */}
                {activeModal === 'archive' &&
                  selectedPerson && (
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                      <h2 className="text-lg font-black text-red-700">
                        Confirm Archive
                      </h2>

                      <p className="mt-2 text-red-600 font-semibold">
                        Are you sure you want to archive
                        <span className="font-black">
                          {' '}
                          {selectedPerson.name}
                        </span>
                        ?
                      </p>
                    </div>
                  )}

                {/* RESET */}
                {activeModal === 'reset' &&
                  selectedPerson && (
                    <div className="p-5 rounded-2xl bg-green-50 border border-green-200">
                      <p className="font-bold text-green-700">
                        Password reset link will be sent
                        to:
                      </p>

                      <p className="mt-2 font-black">
                        {'role' in selectedPerson 
                          ? (selectedPerson as Teacher).email 
                          : (selectedPerson as Student).parentEmail || selectedPerson.name}
                      </p>
                    </div>
                  )}

                {/* ADD TEACHER */}
                {activeModal === 'addTeacher' && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={teacherForm.name}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="email"
                      placeholder="Institutional Email"
                      value={teacherForm.email}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <select
                      value={teacherForm.role}
                      onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    >
                      <option value="">Select Role</option>
                      <option value="teacher">Teacher</option>
                      <option value="adviser">Adviser</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Subject"
                      value={teacherForm.subject}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="text"
                      placeholder="Teacher ID"
                      value={teacherForm.teacherId}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          teacherId: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />
                  </>
                )}

                {/* ADD PARENT */}
                {activeModal === 'addParent' && (
                  <>
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={parentForm.name}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="text"
                      placeholder="LRN"
                      value={parentForm.lrn}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          lrn: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />

                    <input
                      type="email"
                      placeholder="Parent's Email (Optional)"
                      value={parentForm.parentEmail}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          parentEmail: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl border border-[#d8cfc2]"
                    />
                  </>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 p-5 border-t border-[#d8cfc2]">

                <button
                  onClick={closeModal}
                  className="px-5 py-3 rounded-2xl bg-[#f1ece3] text-black font-black"
                >
                  Close
                </button>

                {activeModal === 'edit' && (
                  <button
                    onClick={handleUpdate}
                    className="px-5 py-3 rounded-2xl bg-yellow-500 text-white font-black flex items-center gap-2"
                  >
                    <Save size={16} />
                    Update
                  </button>
                )}

                {activeModal === 'archive' && (
                  <button
                    onClick={handleArchive}
                    className="px-5 py-3 rounded-2xl bg-red-600 text-white font-black flex items-center gap-2"
                  >
                    <Archive size={16} />
                    Confirm Archive
                  </button>
                )}

                {activeModal === 'addTeacher' && (
                  <button
                    onClick={handleAddTeacher}
                    className="px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-black flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                )}

                {activeModal === 'addParent' && (
                  <button
                    onClick={handleAddParent}
                    className="px-5 py-3 rounded-2xl bg-[#7B1C2A] text-white font-black flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                )}

                {activeModal === 'reset' && (
                  <button
                    disabled={isResetting}
                    onClick={async () => {
                      setIsResetting(true);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      const identifier = 'role' in selectedPerson 
                        ? (selectedPerson as Teacher).email 
                        : selectedPerson.name;
                      toast.success('Sequence Synchronized', {
                        description: `Reset link dispatched to ${identifier}`
                      });
                      setIsResetting(false);
                      closeModal();
                    }}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black flex items-center gap-2 disabled:opacity-50"
                  >
                    {isResetting ? <RefreshCcw size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                    {isResetting ? 'Processing...' : 'Confirm Reset'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPeopleManagement;