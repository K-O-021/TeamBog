/**
 * SNED-Link Connected Roster Example
 * This file demonstrates the "Neural Connectivity" between roles.
 */

export const students = [
  { id: "S001", name: "ABAD, FRANZ DIANNE GAMELLA", grade: "Grade 10-A", status: "active" },
  { id: "S002", name: "ABRIL, CURT JERVES", grade: "Grade 10-A", status: "active" },
  { id: "S003", name: "ALARMADO, PAULYN CASTILLO", grade: "Grade 10-A", status: "active" },
  { id: "S004", name: "ALBANO, NOELITA CABINTA", grade: "Grade 10-A", status: "active" },
  { id: "S005", name: "ANENIAS, QUEEN LEANE MABILING", grade: "Grade 10-A", status: "active" },
  { id: "S006", name: "AUDIJE, KRYSTAL SAMBILLOZA", grade: "Grade 10-A", status: "active" },
  { id: "S007", name: "AUSTRIAL, LAWRENCE ANDREI E", grade: "Grade 10-A", status: "active" },
  { id: "S008", name: "BANAWA, ARCEL RALFH MANGUIAT", grade: "Grade 10-A", status: "active" },
  { id: "S009", name: "BRAVO, KEVIN RUEDAS", grade: "Grade 10-A", status: "active" },
  { id: "S010", name: "BRIÑOSA, RAFAEL EDWARD REYES", grade: "Grade 10-A", status: "active" },
  { id: "S011", name: "CAPULONG, PRINCESS MANALO", grade: "Grade 10-A", status: "active" },
  { id: "S012", name: "CORONADO, BHEA BERNADETTE P", grade: "Grade 10-A", status: "active" },
  { id: "S013", name: "DADAP, SHAIRA BODIS", grade: "Grade 10-A", status: "active" },
  { id: "S014", name: "ESPIRITU, DENMARK BARQUILLA", grade: "Grade 10-A", status: "active" },
  { id: "S015", name: "EXCONDE, KATELEY GUTIERREZ", grade: "Grade 10-A", status: "active" },
  { id: "S016", name: "FELIPE, KATHLENE N/A", grade: "Grade 10-A", status: "active" },
  { id: "S017", name: "FERNANDEZ, ERICA MACASINAG", grade: "Grade 10-A", status: "active" },
  { id: "S018", name: "FERNANDEZ, JULLIANE MASMELA", grade: "Grade 10-A", status: "active" },
  { id: "S019", name: "GUINTO, JOHN RODEN CALIBJO", grade: "Grade 10-A", status: "active" },
  { id: "S020", name: "HERNANDEZ, WYNE ANDREI N/A", grade: "Grade 10-A", status: "active" },
  { id: "S021", name: "IBAÑEZ, ROMIEL JOHN RYLE", grade: "Grade 10-B", status: "active" },
  { id: "S022", name: "LARGO, CHRISTINE DIANE BOLO", grade: "Grade 10-B", status: "active" },
  { id: "S023", name: "LITA, JHON CHRISTOPHER C", grade: "Grade 10-B", status: "active" },
  { id: "S024", name: "MATRIANO, CHARLES DAVE ROSAS", grade: "Grade 10-B", status: "active" },
  { id: "S025", name: "MENDOZA, KYLE MICHAEL MARTIN", grade: "Grade 10-B", status: "active" },
  { id: "S026", name: "MORILLO, IRISH BRIONES", grade: "Grade 10-B", status: "active" },
  { id: "S027", name: "OASIN, PHILIP JHON IAN", grade: "Grade 10-B", status: "active" },
  { id: "S028", name: "OLIVEROS, AMIEL SUTARE", grade: "Grade 10-B", status: "active" },
  { id: "S029", name: "PANGANIBAN, BEA ANGELU ROÑO", grade: "Grade 10-B", status: "active" },
  { id: "S030", name: "PILI, MARIA CHRISWELL CAPUNO", grade: "Grade 10-B", status: "active" },
  { id: "S031", name: "RAMOS, CHARLES JOHN LANDICHO", grade: "Grade 10-B", status: "active" },
  { id: "S032", name: "RODRIGUEZ, ZCEDRICH", grade: "Grade 10-B", status: "active" },
  { id: "S033", name: "SUIZA, REÑEL CONDINO", grade: "Grade 10-B", status: "active" },
  { id: "S034", name: "TOLENTINO, REGIE JAMES GETALADO", grade: "Grade 10-B", status: "active" },
  { id: "S035", name: "UMALI, RANDEL BELEN", grade: "Grade 10-B", status: "active" },
  { id: "S036", name: "VIRIÑA, JOHN KURT ALDRIN", grade: "Grade 10-B", status: "active" },
  { id: "S037", name: "OABEL, ELMARK B.", grade: "Grade 10-B", status: "active" },
  { id: "S038", name: "DEHITTA, HAZEL", grade: "Grade 10-B", status: "active" },
  { id: "S039", name: "MARASIGAN, MALCOM", grade: "Grade 10-B", status: "active" },
  { id: "S040", name: "MEJIA, JOHN CARLO", grade: "Grade 10-B", status: "active" }
];

export const users = [
  // ADMIN: Oversight role
  { id: "U001", name: "Admin User", role: "Administrator", status: "Active" },
  
  // TEACHER: Connected to specific students via Grade
  { 
    id: "U002", 
    name: "Mrs. Reyes", 
    role: "Teacher", 
    assignedGrade: "Grade 10-B", 
    status: "Active" 
  },
  
  // PARENT: Directly connected to Student S040 (John Carlo Mejia)
  { 
    id: "U003", 
    name: "Mr. Mejia", 
    role: "Parent", 
    linkedStudentId: "S040", 
    language: "English", 
    status: "Active" 
  }
];

export const behaviorLogs = [
  {
    id: "L001",
    studentId: "S040", // MEJIA, JOHN CARLO
    studentName: "John Carlo Mejia",
    teacherId: "U002",
    userName: "Mrs. Reyes",
    type: "Positive Reinforcement",
    riskLevel: "Low",
    timestamp: new Date().toISOString()
  }
];

export const alerts = [
  {
    id: "A001",
    studentId: "S040",
    message: "Critical pattern detected in Grade 10-B",
    reviewed: false
  }
];

/**
 * HOW THEY CONNECT:
 * 1. Admin (U001) sees the Alert (A001) for John Carlo (S040) in the "Escalation Center".
 * 2. Teacher (U002) is notified because she manages Grade 10-B.
 * 3. Parent (U003) receives an automated AI Sensory recommendation because they are 
 *    linked to S040.
 */

export const fullStudentList = [
  "ABAD, FRANZ DIANNE GAMELLA", "ABRIL, CURT JERVES", "ALARMADO, PAULYN CASTILLO",
  "ALBANO, NOELITA CABINTA", "ANENIAS, QUEEN LEANE MABILING", "AUDIJE, KRYSTAL SAMBILLOZA",
  "AUSTRIAL, LAWRENCE ANDREI E", "BANAWA, ARCEL RALFH MANGUIAT", "BRAVO, KEVIN RUEDAS",
  "BRIÑOSA, RAFAEL EDWARD REYES", "CAPULONG, PRINCESS MANALO", "CORONADO, BHEA BERNADETTE P",
  "DADAP, SHAIRA BODIS", "ESPIRITU, DENMARK BARQUILLA", "EXCONDE, KATELEY GUTIERREZ",
  "FELIPE, KATHLENE N/A", "FERNANDEZ, ERICA MACASINAG", "FERNANDEZ, JULLIANE MASMELA",
  "GUINTO, JOHN RODEN CALIBJO", "HERNANDEZ, WYNE ANDREI N/A", "IBAÑEZ, ROMIEL JOHN RYLE",
  "LARGO, CHRISTINE DIANE BOLO", "LITA, JHON CHRISTOPHER C", "MATRIANO, CHARLES DAVE ROSAS",
  "MENDOZA, KYLE MICHAEL MARTIN", "MORILLO, IRISH BRIONES", "OASIN, PHILIP JHON IAN",
  "OLIVEROS, AMIEL SUTARE", "PANGANIBAN, BEA ANGELU ROÑO", "PILI, MARIA CHRISWELL CAPUNO",
  "RAMOS, CHARLES JOHN LANDICHO", "RODRIGUEZ, ZCEDRICH", "SUIZA, REÑEL CONDINO",
  "TOLENTINO, REGIE JAMES GETALADO", "UMALI, RANDEL BELEN", "VIRIÑA, JOHN KURT ALDRIN",
  "OABEL, ELMARK B.", "DEHITTA, HAZEL", "MARASIGAN, MALCOM", "MEJIA, JOHN CARLO"
];