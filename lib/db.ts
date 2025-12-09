import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Helper functions for database operations
export const db = {
  // Universities
  async getUniversities() {
    return await sql`SELECT * FROM universities ORDER BY name`
  },

  async createUniversity(name: string, abbreviation: string) {
    return await sql`
      INSERT INTO universities (name, abbreviation)
      VALUES (${name}, ${abbreviation})
      RETURNING *
    `
  },

  async updateUniversity(id: number, name: string, abbreviation: string) {
    return await sql`
      UPDATE universities
      SET name = ${name}, abbreviation = ${abbreviation}
      WHERE id = ${id}
      RETURNING *
    `
  },

  async deleteUniversity(id: number) {
    return await sql`DELETE FROM universities WHERE id = ${id}`
  },

  // Classes
  async getClasses() {
    return await sql`
      SELECT c.*, u.name as university_name
      FROM classes c
      LEFT JOIN universities u ON c.university_id = u.id
      ORDER BY c.created_at DESC
    `
  },

  async createClass(name: string, type: string, universityId: number | null, description: string) {
    return await sql`
      INSERT INTO classes (name, type, university_id, description)
      VALUES (${name}, ${type}, ${universityId}, ${description})
      RETURNING *
    `
  },

  async deleteClass(id: number) {
    return await sql`DELETE FROM classes WHERE id = ${id}`
  },

  // Penn Students
  async getPennStudents() {
    return await sql`SELECT * FROM penn_students ORDER BY registered_at DESC`
  },

  async createPennStudent(data: any) {
    return await sql`
      INSERT INTO penn_students (student_id, full_name, email, username, phone, selected_course, status)
      VALUES (${data.studentId}, ${data.fullName}, ${data.email}, ${data.username}, ${data.phone}, ${data.selectedCourse}, ${data.status || "pending"})
      RETURNING *
    `
  },

  async updatePennStudent(id: number, data: any) {
    return await sql`
      UPDATE penn_students
      SET full_name = ${data.fullName}, email = ${data.email}, username = ${data.username},
          phone = ${data.phone}, selected_course = ${data.selectedCourse}, status = ${data.status}
      WHERE id = ${id}
      RETURNING *
    `
  },

  async deletePennStudent(id: number) {
    return await sql`DELETE FROM penn_students WHERE id = ${id}`
  },

  // University Students
  async getUniversityStudents() {
    return await sql`
      SELECT us.*, u.name as university_name, c.name as class_name
      FROM university_students us
      LEFT JOIN universities u ON us.university_id = u.id
      LEFT JOIN classes c ON us.class_id = c.id
      ORDER BY us.registered_at DESC
    `
  },

  async createUniversityStudent(data: any) {
    return await sql`
      INSERT INTO university_students (student_id, full_name, phone, address, university_id, class_id, status)
      VALUES (${data.studentId}, ${data.fullName}, ${data.phone}, ${data.address}, ${data.universityId}, ${data.classId}, ${data.status || "active"})
      RETURNING *
    `
  },

  async updateUniversityStudent(id: number, data: any) {
    return await sql`
      UPDATE university_students
      SET full_name = ${data.fullName}, phone = ${data.phone}, address = ${data.address},
          university_id = ${data.universityId}, class_id = ${data.classId}, status = ${data.status}
      WHERE id = ${id}
      RETURNING *
    `
  },

  async deleteUniversityStudent(id: number) {
    return await sql`DELETE FROM university_students WHERE id = ${id}`
  },

  // Assignments
  async getAssignments() {
    return await sql`
      SELECT a.*, c.name as class_name
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      ORDER BY a.created_at DESC
    `
  },

  async createAssignment(data: any) {
    return await sql`
      INSERT INTO assignments (title, description, class_id, period, max_marks, due_date)
      VALUES (${data.title}, ${data.description}, ${data.classId}, ${data.period}, ${data.maxMarks}, ${data.dueDate})
      RETURNING *
    `
  },

  async deleteAssignment(id: number) {
    return await sql`DELETE FROM assignments WHERE id = ${id}`
  },

  // Student Marks
  async getStudentMarks() {
    return await sql`
      SELECT sm.*, a.title as assignment_title, a.max_marks, c.name as class_name
      FROM student_marks sm
      JOIN assignments a ON sm.assignment_id = a.id
      LEFT JOIN classes c ON a.class_id = c.id
      ORDER BY sm.submitted_at DESC
    `
  },

  async saveStudentMarks(
    studentId: string,
    assignmentId: number,
    marksObtained: number,
    percentage: number,
    grade: string,
  ) {
    return await sql`
      INSERT INTO student_marks (student_id, assignment_id, marks_obtained, percentage, grade)
      VALUES (${studentId}, ${assignmentId}, ${marksObtained}, ${percentage}, ${grade})
      ON CONFLICT (student_id, assignment_id)
      DO UPDATE SET marks_obtained = ${marksObtained}, percentage = ${percentage}, grade = ${grade}, submitted_at = CURRENT_TIMESTAMP
      RETURNING *
    `
  },

  // Courses
  async getCourses() {
    return await sql`SELECT * FROM courses ORDER BY created_at DESC`
  },

  async createCourse(data: any) {
    return await sql`
      INSERT INTO courses (title, description, instructor, duration, thumbnail, rating, students_count, type)
      VALUES (${data.title}, ${data.description}, ${data.instructor}, ${data.duration}, ${data.thumbnail}, ${data.rating || 0}, ${data.studentsCount || 0}, ${data.type})
      RETURNING *
    `
  },
}
