// Extended data structures for comprehensive admin panel

export interface PennStudent {
  id: string
  name: string
  email: string
  username: string
  phone: string
  selectedCourse: string
  status: "pending" | "approved" | "rejected"
  registrationDate: string
}

export interface UniversityStudent {
  id: string
  fullName: string
  phone: string
  address?: string
  university: string
  class: string
  completedLessons: number
  totalLessons: number
  avgProgress: number
  watchTime: number
}

export interface University {
  id: string
  name: string
  abbreviation: string
  createdDate: string
}

export interface Class {
  id: string
  name: string
  university: string
  description: string
  type: "penn" | "university"
  createdDate: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  classId: string
  maxMarks: number
  dueDate: string
  period: string
  submissions: number
  avgScore: number
  status: "active" | "closed"
}

export interface Video {
  id: string
  title: string
  courseId: string
  duration: string
  views: number
  completionRate: number
  uploadDate: string
}

export interface PerformanceData {
  studentId: string
  courseId: string
  completedLessons: number
  totalLessons: number
  quizScores: number[]
  timeSpent: number
  lastAccessed: string
}

export interface StudentMark {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  assignmentTitle: string
  classId: string
  className: string
  marksObtained: number
  maxMarks: number
  percentage: number
  grade: string
  submissionDate: string
}

// Initialize admin data
export function initializeAdminData() {
  if (typeof window === "undefined") return

  // Penn Students
  if (!localStorage.getItem("pennStudents")) {
    const pennStudents: PennStudent[] = []
    localStorage.setItem("pennStudents", JSON.stringify(pennStudents))
  }

  // University Students
  if (!localStorage.getItem("universityStudents")) {
    const universityStudents: UniversityStudent[] = [
      {
        id: "132244",
        fullName: "Ahmed Ali",
        phone: "252617665544",
        university: "Somali International University",
        class: "SIU-Semester 1-A-FullTime",
        completedLessons: 0,
        totalLessons: 6,
        avgProgress: 0,
        watchTime: 0,
      },
      {
        id: "132245",
        fullName: "Fatima Hassan",
        phone: "252612345678",
        university: "SIMAD University",
        class: "SIMAD-Semester 2-B",
        completedLessons: 0,
        totalLessons: 6,
        avgProgress: 0,
        watchTime: 0,
      },
      {
        id: "132246",
        fullName: "Mohamed Omar",
        phone: "252619876543",
        university: "Mogadishu University",
        class: "MU-Year 1-A",
        completedLessons: 0,
        totalLessons: 6,
        avgProgress: 0,
        watchTime: 0,
      },
      {
        id: "STU001",
        fullName: "John Doe",
        phone: "1234567890",
        university: "Somali International University",
        class: "SIU-Semester 1-B",
        completedLessons: 0,
        totalLessons: 6,
        avgProgress: 0,
        watchTime: 0,
      },
      {
        id: "STU002",
        fullName: "Jane Smith",
        phone: "0987654321",
        university: "SIMAD University",
        class: "SIMAD-Semester 1-A",
        completedLessons: 0,
        totalLessons: 6,
        avgProgress: 0,
        watchTime: 0,
      },
      {
        id: "STU003",
        fullName: "Mike Johnson",
        phone: "5551234567",
        university: "Mogadishu University",
        class: "MU-Year 2-C",
        completedLessons: 0,
        totalLessons: 6,
        avgProgress: 0,
        watchTime: 0,
      },
    ]
    localStorage.setItem("universityStudents", JSON.stringify(universityStudents))
  }

  // Universities
  if (!localStorage.getItem("universities")) {
    const universities: University[] = [
      { id: "mu", name: "Mogadishu University", abbreviation: "MU", createdDate: "2024-01-15" },
      { id: "simad", name: "SIMAD University", abbreviation: "SIMAD", createdDate: "2024-01-20" },
      { id: "siu", name: "Somali International University", abbreviation: "SIU", createdDate: "2024-01-25" },
      { id: "uniso", name: "Somalia", abbreviation: "UNISO", createdDate: "2024-02-01" },
    ]
    localStorage.setItem("universities", JSON.stringify(universities))
  }

  // Classes
  if (!localStorage.getItem("classes")) {
    const classes: Class[] = [
      {
        id: "cms5e",
        name: "CMS5E",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms5d",
        name: "CMS5D",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms5c",
        name: "CMS5C",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms5b",
        name: "CMS5B",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms5a",
        name: "CMS5A",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cmsapt",
        name: "CMSAPT",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms3e",
        name: "CMS3E",
        university: "Somali International University",
        description: "N/A",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms3c",
        name: "CMS3C",
        university: "Somali International University",
        description: "adisdfs",
        type: "university",
        createdDate: "2025-12-02",
      },
      {
        id: "cms3d",
        name: "CMS3D",
        university: "Somali International University",
        description: "Semester 3aad ee Jamacada SIU",
        type: "university",
        createdDate: "2025-12-02",
      },
    ]
    localStorage.setItem("classes", JSON.stringify(classes))
  }

  // Assignments
  if (!localStorage.getItem("assignments")) {
    const assignments: Assignment[] = []
    localStorage.setItem("assignments", JSON.stringify(assignments))
  }

  // Videos
  if (!localStorage.getItem("videos")) {
    const videos: Video[] = []
    localStorage.setItem("videos", JSON.stringify(videos))
  }

  // Student Marks
  if (!localStorage.getItem("studentMarks")) {
    const studentMarks: StudentMark[] = [
      {
        id: "mark1",
        studentId: "135780",
        studentName: "Student 135780",
        assignmentId: "assign5",
        assignmentTitle: "Assignment #5",
        classId: "cms5d",
        className: "CMS5D",
        marksObtained: 4,
        maxMarks: 4,
        percentage: 100,
        grade: "A+",
        submissionDate: "2025-12-12",
      },
    ]
    localStorage.setItem("studentMarks", JSON.stringify(studentMarks))
  }
}

// Getter functions
export function getPennStudents(): PennStudent[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("pennStudents") || "[]")
}

export function getUniversityStudents(): UniversityStudent[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("universityStudents") || "[]")
}

export function getUniversities(): University[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("universities") || "[]")
}

export function getClasses(): Class[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("classes") || "[]")
}

export function getAssignments(): Assignment[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("assignments") || "[]")
}

export function getVideos(): Video[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("videos") || "[]")
}

// Getter for student marks
export function getStudentMarks(): StudentMark[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("studentMarks") || "[]")
}

// Setter functions
export function savePennStudents(students: PennStudent[]) {
  localStorage.setItem("pennStudents", JSON.stringify(students))
}

export function saveUniversityStudents(students: UniversityStudent[]) {
  localStorage.setItem("universityStudents", JSON.stringify(students))
}

export function saveUniversities(universities: University[]) {
  localStorage.setItem("universities", JSON.stringify(universities))
}

export function saveClasses(classes: Class[]) {
  localStorage.setItem("classes", JSON.stringify(classes))
}

export function saveAssignments(assignments: Assignment[]) {
  localStorage.setItem("assignments", JSON.stringify(assignments))
}

export function saveVideos(videos: Video[]) {
  localStorage.setItem("videos", JSON.stringify(videos))
}

// Setter for student marks
export function saveStudentMarks(marks: StudentMark[]) {
  localStorage.setItem("studentMarks", JSON.stringify(marks))
}

// CRUD operations
export function approvePennStudent(id: string) {
  const students = getPennStudents()
  const updated = students.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
  savePennStudents(updated)
}

export function deletePennStudent(id: string) {
  const students = getPennStudents()
  savePennStudents(students.filter((s) => s.id !== id))
}

export function deleteUniversityStudent(id: string) {
  const students = getUniversityStudents()
  saveUniversityStudents(students.filter((s) => s.id !== id))
}

export function deleteUniversity(id: string) {
  const universities = getUniversities()
  saveUniversities(universities.filter((u) => u.id !== id))
}

export function deleteClass(id: string) {
  const classes = getClasses()
  saveClasses(classes.filter((c) => c.id !== id))
}

export function deleteAssignment(id: string) {
  const assignments = getAssignments()
  saveAssignments(assignments.filter((a) => a.id !== id))
}

export function addUniversity(university: Omit<University, "id" | "createdDate">) {
  const universities = getUniversities()
  const newUniversity: University = {
    ...university,
    id: university.abbreviation.toLowerCase(),
    createdDate: new Date().toISOString().split("T")[0],
  }
  universities.push(newUniversity)
  saveUniversities(universities)
}

export function addClass(classData: Omit<Class, "id" | "createdDate">) {
  const classes = getClasses()
  const newClass: Class = {
    ...classData,
    id: classData.name.toLowerCase().replace(/\s+/g, "-"),
    createdDate: new Date().toISOString().split("T")[0],
  }
  classes.push(newClass)
  saveClasses(classes)
}

export function addAssignment(assignment: Omit<Assignment, "id" | "submissions" | "avgScore" | "status">) {
  const assignments = getAssignments()
  const newAssignment: Assignment = {
    ...assignment,
    id: `assign-${Date.now()}`,
    submissions: 0,
    avgScore: 0,
    status: "active",
  }
  assignments.push(newAssignment)
  saveAssignments(assignments)
}

export function updateUniversityStudent(id: string, data: Partial<UniversityStudent>) {
  const students = getUniversityStudents()
  const updated = students.map((s) => (s.id === id ? { ...s, ...data } : s))
  saveUniversityStudents(updated)
}

export function addUniversityStudent(student: Omit<UniversityStudent, "id">) {
  const students = getUniversityStudents()
  const newStudent: UniversityStudent = {
    ...student,
    id: `STU${Date.now().toString().slice(-6)}`,
  }
  students.push(newStudent)
  saveUniversityStudents(students)
}

export function updateUniversity(id: string, data: Partial<University>) {
  const universities = getUniversities()
  const updated = universities.map((u) => (u.id === id ? { ...u, ...data } : u))
  saveUniversities(updated)
}

export function updateClass(id: string, data: Partial<Class>) {
  const classes = getClasses()
  const updated = classes.map((c) => (c.id === id ? { ...c, ...data } : c))
  saveClasses(updated)
}

export function updateAssignment(id: string, data: Partial<Assignment>) {
  const assignments = getAssignments()
  const updated = assignments.map((a) => (a.id === id ? { ...a, ...data } : a))
  saveAssignments(updated)
}

// Function to calculate grade based on percentage
export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

// Function to add student marks
export function addStudentMark(mark: Omit<StudentMark, "id" | "percentage" | "grade">) {
  const marks = getStudentMarks()
  const percentage = (mark.marksObtained / mark.maxMarks) * 100
  const newMark: StudentMark = {
    ...mark,
    id: `mark-${Date.now()}`,
    percentage,
    grade: calculateGrade(percentage),
  }
  marks.push(newMark)
  saveStudentMarks(marks)
}
