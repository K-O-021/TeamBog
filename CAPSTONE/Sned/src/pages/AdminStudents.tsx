import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import RiskBadge from '@/components/RiskBadge';
import BehaviorBadge from '@/components/BehaviorBadge';
import {
  Archive,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Brain,
  Sparkles,
  AlertCircle,
  Loader2,
  ClipboardCheck,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

import { toast } from "sonner";
import AdminHeader from '@/components/AdminHeader';

const SNED_CATEGORIES = [
  "Autism Spectrum Disorder (ASD)",
  "ADHD",
  "Intellectual Disability (ID)",
  "Down Syndrome",
  "Cerebral Palsy (CP)",
  "Learning Disability (LD)",
  "Hearing Impairment",
  "Visual Impairment",
  "Speech/Language Disorder",
  "Multiple Disabilities"
];

const SUPPORT_LEVELS = [
  "Full Assistance",
  "Moderate Support",
  "Minimal Supervision"
];

interface AdminStudentsProps {
  globalSearchTerm?: string;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

const AdminStudents: React.FC<AdminStudentsProps> = ({
  globalSearchTerm = '',
  isAddModalOpen: externalIsAddModalOpen,
  setIsAddModalOpen: externalSetIsAddModalOpen
}) => {

  const {
    students,
    archiveStudent,
    updateStudent,
    behaviorLogs,
    addBehaviorLog,
    addStudent,
    users,
    addUser,
    progressNotes,
    isConnected,
    latency
  } = useApp();

  const [filterGrade, setFilterGrade] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [viewingStudent, setViewingStudent] = useState<any>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [editingStudent, setEditingStudent] = useState<any>(null);

  const [archivingIds, setArchivingIds] = useState<string[]>([]);

  const [localIsAddModalOpen, setLocalIsAddModalOpen] = useState(false);

  const [addStep, setAddStep] = useState(1);

  const [newStudentForm, setNewStudentForm] = useState({
    lrn: '',
    name: '',
    dob: '',
    gender: 'Male',
    grade: 'Grade 1',
    diagnosis: SNED_CATEGORIES[0],
    supportLevel: SUPPORT_LEVELS[2],
    baseline: '',
    parentName: '',
    parentEmail: '',
  });

  const [showQuickLog, setShowQuickLog] = useState(false);

  const [quickLogForm, setQuickLogForm] = useState({
    type: 'Positive' as
      | 'Positive'
      | 'Attention Needed'
      | 'Concerning',
    description: '',
    location: 'Classroom'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    grade: ''
  });

  const isAddModalOpen =
    externalIsAddModalOpen !== undefined
      ? externalIsAddModalOpen
      : localIsAddModalOpen;

  const setIsAddModalOpen =
    externalSetIsAddModalOpen !== undefined
      ? externalSetIsAddModalOpen
      : setLocalIsAddModalOpen;

  const itemsPerPage = 5;

  useEffect(() => {
    const email = newStudentForm.parentEmail
      .trim()
      .toLowerCase();

    if (email && addStep === 4) {

      const parent = users.find(
        u =>
          u.email.toLowerCase() === email &&
          u.role === 'parent'
      );

      if (
        parent &&
        newStudentForm.parentName !== parent.name
      ) {
        setNewStudentForm(prev => ({
          ...prev,
          parentName: parent.name
        }));

        toast.success(
          `Parent account detected: ${parent.name}`
        );
      }
    }

  }, [
    newStudentForm.parentEmail,
    users,
    addStep
  ]);

  const activeStudents = students.filter(s =>
    s.status === 'active' &&
    s.name?.toLowerCase()
      .includes(globalSearchTerm.toLowerCase()) &&
    (
      filterGrade === 'all' ||
      s.grade.includes(filterGrade)
    ) &&
    (
      filterRisk === 'all' ||
      s.riskLevel === filterRisk
    )
  );

  const totalPages = Math.ceil(
    activeStudents.length / itemsPerPage
  );

  const paginatedStudents =
    activeStudents.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {

    if (
      selectedIds.length ===
      paginatedStudents.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        paginatedStudents.map(s => s.id)
      );
    }
  };

  const handleEditClick = (student: any) => {

    setEditingStudent(student);

    setEditForm({
      name: student.name,
      grade: student.grade
    });
  };

  const handleUpdateSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (
      updateStudent &&
      editingStudent
    ) {

      updateStudent(
        editingStudent.id,
        {
          name: editForm.name,
          grade: editForm.grade
        }
      );

      toast.success(
        "Student details updated"
      );
    }

    setEditingStudent(null);
  };

  const handleConfirmArchive = () => {

    if (archivingIds.length > 0) {

      archivingIds.forEach(id =>
        archiveStudent(id)
      );

      toast.success(
        `${archivingIds.length} student(s) archived`
      );

      setArchivingIds([]);
      setSelectedIds([]);
    }
  };

  return (

    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      <AdminHeader
        icon={GraduationCap}
        title="Learner"
        highlightedTitle="Profiles"
        subtitle="Institutional Behavioral Records"
        showSystemLink
        isConnected={isConnected}
        latency={latency}
      />

      <div className="space-y-4">

        <div className="flex flex-col md:flex-row gap-4">

          <button
            onClick={handleSelectAll}
            className="flex-1 px-6 py-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all bg-white/50 border-slate-200 text-slate-600"
          >
            Select Page
          </button>

          <select
            value={filterGrade}
            onChange={(e) => {
              setFilterGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-6 py-4 rounded-2xl"
          >
            <option value="all">
              All Grades
            </option>

            <option value="Grade 1">
              Grade 1
            </option>

            <option value="Grade 2">
              Grade 2
            </option>

            <option value="Grade 3">
              Grade 3
            </option>

          </select>

          <select
            value={filterRisk}
            onChange={(e) => {
              setFilterRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-6 py-4 rounded-2xl"
          >
            <option value="all">
              All Risk Levels
            </option>

            <option value="Low">
              Low Risk
            </option>

            <option value="Moderate">
              Moderate Risk
            </option>

            <option value="High">
              High Risk
            </option>

          </select>

        </div>

        <div className="space-y-3">

          {paginatedStudents.map((s) => (

            <div
              key={s.id}
              className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem]"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() =>
                      handleSelectOne(s.id)
                    }
                  />

                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50">

                    <GraduationCap className="w-6 h-6" />

                  </div>

                  <div>

                    <p className="font-black text-slate-800 text-base">
                      {s.name}
                    </p>

                    <div className="flex items-center gap-2">

                      <span className="text-[10px] font-bold text-slate-400">
                        {s.grade}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400">
                        Teacher: {s.teacher || 'Unassigned'}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <RiskBadge level={s.riskLevel} />

                  <button
                    onClick={() =>
                      setArchivingIds([s.id])
                    }
                    className="p-1.5 rounded-lg border-2"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() =>
                    setViewingStudent(s)
                  }
                  className="px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black"
                >
                  View Profile
                </button>

                <button
                  onClick={() =>
                    handleEditClick(s)
                  }
                  className="px-3 py-1.5 rounded-lg border-2"
                >
                  Edit
                </button>

              </div>

            </div>

          ))}

        </div>

        {viewingStudent && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80">

            <div className="card-elevated w-full max-w-3xl p-6 relative shadow-2xl max-h-[92vh] overflow-y-auto">

              <button
                onClick={() =>
                  setViewingStudent(null)
                }
                className="absolute right-4 top-4"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">

                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">

                  {viewingStudent.initials}

                </div>

                <div>

                  <h3 className="text-2xl font-bold">
                    {viewingStudent.name}
                  </h3>

                  <p>
                    {viewingStudent.grade}
                  </p>

                </div>

              </div>

              <div className="mt-6 border-t pt-6">

                <div className="space-y-3 max-h-60 overflow-y-auto">

                  {(behaviorLogs || [])
                    .filter(
                      log =>
                        log.studentId ===
                        viewingStudent.id
                    )
                    .map(log => (

                      <div
                        key={log.id}
                        className="p-3 bg-muted/30 rounded-lg border"
                      >

                        <div className="flex justify-between items-start mb-1">

                          <BehaviorBadge
                            type={log.type}
                            confidence={log.confidence || 0}
                          />

                          <span className="text-[10px]">
                            {log.date}
                          </span>

                        </div>

                        <p className="text-sm mt-1">
                          {log.description}
                        </p>

                      </div>

                    ))}

                </div>

              </div>

            </div>

          </div>

        )}

        {editingStudent && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80">

            <div className="card-elevated w-full max-w-md p-6 relative shadow-2xl">

              <button
                onClick={() =>
                  setEditingStudent(null)
                }
                className="absolute right-4 top-4"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold mb-4">
                Edit Student
              </h3>

              <form
                onSubmit={handleUpdateSubmit}
                className="space-y-4"
              >

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border-2"
                />

                <select
                  value={editForm.grade}
                  onChange={(e) =>
                    setEditForm(prev => ({
                      ...prev,
                      grade: e.target.value
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border-2"
                >

                  <option value="Grade 1">
                    Grade 1
                  </option>

                  <option value="Grade 2">
                    Grade 2
                  </option>

                  <option value="Grade 3">
                    Grade 3
                  </option>

                </select>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary text-white"
                >
                  Save Changes
                </button>

              </form>

            </div>

          </div>

        )}

        {archivingIds.length > 0 && (

          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80">

            <div className="card-elevated w-full max-w-sm p-6 relative shadow-2xl">

              <h3 className="text-xl font-bold mb-2">
                Archive Student?
              </h3>

              <p className="text-sm text-muted-foreground mb-6">
                This will archive the selected student.
              </p>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setArchivingIds([])
                  }
                  className="flex-1 py-2 rounded-lg border-2"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmArchive}
                  className="flex-1 py-2 rounded-lg bg-warning text-warning-foreground"
                >
                  Archive Now
                </button>

              </div>

            </div>

          </div>

        )}

        {totalPages > 1 && (

          <div className="flex justify-center items-center gap-2 pt-4">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(prev => prev - 1)
              }
              className="p-2 rounded-lg border-2 border-border disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage(prev => prev + 1)
              }
              className="p-2 rounded-lg border-2 border-border disabled:opacity-50"
            >
              Next
            </button>

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminStudents;