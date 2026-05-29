import React, { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getActiveStudentsQuery, StudentDoc, archiveStudent, updateStudent } from '@/lib/firestoreQueries';
import { useApp } from '@/context/AppContext'; // Assuming AppContext provides user role for conditional rendering
import { toast } from 'sonner';
import { EditStudentModal } from '@/components/EditStudentModal'; // Import the new modal
import { ViewStudentModal } from '@/components/ViewStudentModal'; // Import the view modal

const AdminStudentsPage: React.FC = () => {
  const { user } = useApp(); // Get user from context to check role
  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [editingStudent, setEditingStudent] = useState<StudentDoc | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError("You do not have permission to view this page.");
      setLoading(false);
      return;
    }

    const studentsQuery = getActiveStudentsQuery();
    const unsubscribe = onSnapshot(
      studentsQuery,
      (querySnapshot) => {
        const studentsList: StudentDoc[] = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is already converted to StudentDoc by the converter
          studentsList.push({ id: doc.id, ...doc.data() } as StudentDoc);
        });
        setStudents(studentsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again.");
        setLoading(false);
      }
    );

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [user]); // Re-run effect if user changes

  const handleArchive = async (id: string, name: string) => {
    try {
      await archiveStudent(id);
      toast.success(`${name} has been moved to the Archive Vault.`);
    } catch (err) {
      toast.error("Failed to archive student.");
    }
  };

  const handleEdit = (student: StudentDoc) => {
    setEditingStudent(student);
  };

  const handleCloseEditModal = () => {
    setEditingStudent(null);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#7B1C2A]">Active Students</h1>
      {students.length === 0 ? (
        <p className="text-slate-600">No active students found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-md p-5 border border-[#eadfce]">
              <h2 className="text-xl font-semibold text-[#7B1C2A]">{student.name}</h2>
              <p className="text-sm text-slate-600 mt-1">Grade: {student.grade}</p>
              <p className="text-sm text-slate-600">Teacher: {student.teacher}</p>
              <p className={`text-sm mt-2 font-medium ${student.riskLevel === 'High' ? 'text-red-500' : student.riskLevel === 'Moderate' ? 'text-orange-500' : 'text-green-500'}`}>
                Risk Level: {student.riskLevel}
              </p>
              <div className="mt-4 flex gap-2">
                {/* The "View" button can be implemented similarly to "Edit" if you need a view-only modal */}
                <button 
                  onClick={() => handleEdit(student)} // Use handleEdit to open the modal
                  className="text-xs bg-slate-100 px-3 py-1 rounded hover:bg-slate-200">Edit</button>
                <button 
                  onClick={() => handleArchive(student.id!, student.name)}
                  className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded hover:bg-rose-100"
                >Archive</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingStudent && <EditStudentModal student={editingStudent} onClose={handleCloseEditModal} />}
      {viewingStudent && <ViewStudentModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
    </div>
  );
};

export default AdminStudentsPage;