import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as bcrypt from 'bcryptjs';

// MongoDB Models (using Mongoose-like structure)
export interface Teacher {
  _id?: string;
  teacher_id: string;
  name: string;
  email: string;
  subject: string;
  password?: string;
  password_hash?: string;
  created_at?: Date;
  created_by?: string;
}

export interface Student {
  _id?: string;
  student_id: string;
  name: string;
  email: string;
  class: string;
  password?: string;
  password_hash?: string;
  created_at?: Date;
  created_by?: string;
}

export interface Timetable {
  _id?: string;
  subject_code: string;
  subject_name: string;
  credit_hours: number;
  teacher_id: string;
  class: string;
  created_at?: Date;
  teachers?: {
    name: string;
    email: string;
    subject: string;
  };
}

export interface Marks {
  _id?: string;
  student_id: string;
  subject_code: string;
  test1: number;
  test2: number;
  cat1: number;
  mid_semester: number;
  quiz_marks: number;
  teacher_id?: string;
  updated_at?: Date;
  students?: {
    name: string;
    student_id: string;
    class: string;
  };
}

export interface Attendance {
  _id?: string;
  student_id: string;
  subject_code: string;
  date: string;
  status: string;
  marked_via?: string;
  created_at?: Date;
  students?: {
    name: string;
    student_id: string;
  };
}

export interface Quiz {
  _id?: string;
  subject_code: string;
  teacher_id: string;
  class: string;
  quiz_code: string;
  questions: any[];
  active: boolean;
  created_at?: Date;
  expires_at?: Date;
}

export interface QuizSubmission {
  _id?: string;
  quiz_id: string;
  student_id: string;
  answers: any;
  score: number;
  submitted_at?: Date;
  students?: {
    name: string;
    student_id: string;
  };
}

export interface Admin {
  _id?: string;
  email: string;
  name: string;
  password_hash?: string;
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MongoDBService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock MongoDB collections (in a real app, these would be actual MongoDB collections)
  private teachers: Teacher[] = [];
  private students: Student[] = [];
  private timetables: Timetable[] = [];
  private marks: Marks[] = [];
  private attendance: Attendance[] = [];
  private quizzes: Quiz[] = [];
  private quizSubmissions: QuizSubmission[] = [];
  private admins: Admin[] = [];
  private loginAudit: Array<{ role: string; id: string; email: string; timestamp: string }>= [];
  private mongoSetupLogged = false;

  constructor() {
    this.loadUser();
    this.initializeDefaultData();
    this.loadQuizzesFromStorage();
    this.loadFromSession();
    this.loadLoginAudit();
    this.logMongoSetup();
  }

  private async loadUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private initializeDefaultData() {
    // Initialize with built-in admin credential
    if (this.admins.length === 0) {
      this.admins.push({
        _id: 'admin1',
        email: 'praneethva662@gmail.com',
        name: 'Administrator',
        created_at: new Date()
      });
    }
  }

  private loadQuizzesFromStorage() {
    try {
      const raw = localStorage.getItem('quizzes');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.quizzes = parsed;
        }
      }
    } catch {}
  }

  private saveQuizzesToStorage() {
    try {
      localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
    } catch {}
  }

  private loadFromSession() {
    try {
      const parse = (key: string) => {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      };
      const tchs = parse('teachers');
      const stds = parse('students');
      const tts = parse('timetables');
      const mks = parse('marks');
      const atd = parse('attendance');
      const qzs = parse('quizzes');
      const qsubs = parse('quizSubmissions');

      if (Array.isArray(tchs)) this.teachers = tchs;
      if (Array.isArray(stds)) this.students = stds;
      if (Array.isArray(tts)) this.timetables = tts;
      if (Array.isArray(mks)) this.marks = mks;
      if (Array.isArray(atd)) this.attendance = atd;
      if (Array.isArray(qzs)) this.quizzes = qzs;
      if (Array.isArray(qsubs)) this.quizSubmissions = qsubs;
    } catch {}
  }

  private saveToSession() {
    try {
      sessionStorage.setItem('teachers', JSON.stringify(this.teachers));
      sessionStorage.setItem('students', JSON.stringify(this.students));
      sessionStorage.setItem('timetables', JSON.stringify(this.timetables));
      sessionStorage.setItem('marks', JSON.stringify(this.marks));
      sessionStorage.setItem('attendance', JSON.stringify(this.attendance));
      sessionStorage.setItem('quizzes', JSON.stringify(this.quizzes));
      sessionStorage.setItem('quizSubmissions', JSON.stringify(this.quizSubmissions));
      sessionStorage.setItem('loginAudit', JSON.stringify(this.loginAudit));
    } catch {}
  }

  private loadLoginAudit() {
    try {
      const raw = sessionStorage.getItem('loginAudit');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.loginAudit = parsed;
      }
    } catch {}
  }

  private logMongoSetup() {
    if (this.mongoSetupLogged) return;
    this.mongoSetupLogged = true;
    console.log('🗄️ MongoDB (mock) setup initialized in browser console context.');
    console.log('➡️ Collections available:', {
      teachers: 'sessionStorage["teachers"]',
      students: 'sessionStorage["students"]',
      timetables: 'sessionStorage["timetables"]',
      marks: 'sessionStorage["marks"]',
      attendance: 'sessionStorage["attendance"]',
      quizzes: 'localStorage["quizzes"], sessionStorage["quizzes"]',
      quizSubmissions: 'sessionStorage["quizSubmissions"]',
      loginAudit: 'sessionStorage["loginAudit"]'
    });
  }

  async adminLogin(email: string, password: string): Promise<any> {
    // Validate against built-in credentials only
    const validEmail = 'praneethva662@gmail.com';
    const validPassword = 'Praneeth17';

    if (email !== validEmail || password !== validPassword) {
      throw new Error('Invalid credentials');
    }

    const admin = this.admins.find(a => a.email === validEmail)!;

    const userData = { ...admin, role: 'admin' };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    this.recordLogin('admin', admin._id || 'admin', email);
    return userData;
  }

  async teacherLogin(email: string, teacherId: string, password: string): Promise<any> {
    const teacher = this.teachers.find(t => 
      t.email === email && t.teacher_id === teacherId
    );

    if (!teacher) {
      throw new Error('Invalid credentials or teacher not found in system');
    }

    const userData = { ...teacher, role: 'teacher' };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    this.recordLogin('teacher', teacher.teacher_id, email);
    return userData;
  }

  async studentLogin(email: string, studentId: string, password: string): Promise<any> {
    const student = this.students.find(s => 
      s.email === email && s.student_id === studentId
    );

    if (!student) {
      throw new Error('Invalid credentials or student not found in system');
    }

    const userData = { ...student, role: 'student' };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    this.recordLogin('student', student.student_id, email);
    return userData;
  }

  private recordLogin(role: string, id: string, email: string) {
    const entry = { role, id, email, timestamp: new Date().toISOString() };
    this.loginAudit.push(entry);
    this.saveToSession();
    console.log('🗃️ MongoDB (mock) login audit saved:', entry);
    console.log('📚 Current loginAudit:', this.loginAudit);
  }

  logout() {
    const user = this.getCurrentUser();
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    if (user && user.role === 'admin') {
      sessionStorage.removeItem('teachers');
      sessionStorage.removeItem('students');
      sessionStorage.removeItem('timetables');
      sessionStorage.removeItem('marks');
      sessionStorage.removeItem('attendance');
      sessionStorage.removeItem('quizzes');
      sessionStorage.removeItem('quizSubmissions');
    }
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  async addTeacher(teacher: Teacher): Promise<any> {
    console.log('📝 Adding new teacher:', teacher);
    const passwordHash = await this.hashPassword(teacher.password || '');
    const { password, ...teacherData } = teacher;

    const newTeacher: Teacher = {
      ...teacherData,
      _id: this.generateId(),
      password_hash: passwordHash,
      created_at: new Date()
    };

    this.teachers.push(newTeacher);
    this.saveToSession();
    console.log('✅ Teacher added successfully:', newTeacher);
    console.log('📊 Current teachers in database:', this.teachers);
    return newTeacher;
  }

  async addStudent(student: Student): Promise<any> {
    console.log('📝 Adding new student:', student);
    const passwordHash = await this.hashPassword(student.password || '');
    const { password, ...studentData } = student;

    const newStudent: Student = {
      ...studentData,
      _id: this.generateId(),
      password_hash: passwordHash,
      created_at: new Date()
    };

    this.students.push(newStudent);
    this.saveToSession();
    console.log('✅ Student added successfully:', newStudent);
    console.log('📊 Current students in database:', this.students);
    return newStudent;
  }

  async getTeachers(): Promise<Teacher[]> {
    this.loadFromSession();
    return [...this.teachers].sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }

  async getStudents(): Promise<Student[]> {
    this.loadFromSession();
    return [...this.students].sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }

  async addTimetable(timetable: Timetable): Promise<any> {
    const newTimetable: Timetable = {
      ...timetable,
      _id: this.generateId(),
      created_at: new Date()
    };

    this.timetables.push(newTimetable);
    this.saveToSession();
    return newTimetable;
  }

  async getTimetables(classFilter?: string): Promise<Timetable[]> {
    this.loadFromSession();
    let filteredTimetables = [...this.timetables];

    if (classFilter) {
      filteredTimetables = filteredTimetables.filter(t => t.class === classFilter);
    }

    // Add teacher information
    const timetablesWithTeachers = filteredTimetables.map(timetable => {
      const teacher = this.teachers.find(t => t.teacher_id === timetable.teacher_id);
      return {
        ...timetable,
        teachers: teacher ? {
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject
        } : undefined
      };
    });

    return timetablesWithTeachers.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }

  async getStudentMarks(studentId: string): Promise<Marks[]> {
    this.loadFromSession();
    return this.marks.filter(m => m.student_id === studentId);
  }

  async updateMarks(marksId: string, marksData: Partial<Marks>): Promise<any> {
    const index = this.marks.findIndex(m => m._id === marksId);
    if (index === -1) {
      throw new Error('Marks not found');
    }

    this.marks[index] = {
      ...this.marks[index],
      ...marksData,
      updated_at: new Date()
    };
    this.saveToSession();
    return this.marks[index];
  }

  async createMarks(marks: Marks): Promise<any> {
    const newMarks: Marks = {
      ...marks,
      _id: this.generateId(),
      updated_at: new Date()
    };

    this.marks.push(newMarks);
    this.saveToSession();
    return newMarks;
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    this.loadFromSession();
    return this.attendance
      .filter(a => a.student_id === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createAttendance(att: Attendance): Promise<Attendance> {
    console.log('📝 Creating attendance record:', att);
    const newAttendance: Attendance = {
      ...att,
      _id: this.generateId(),
      created_at: new Date()
    };
    this.attendance.push(newAttendance);
    this.saveToSession();
    console.log('✅ Attendance created successfully:', newAttendance);
    console.log('📊 Current attendance records:', this.attendance);
    return newAttendance;
  }

  async createQuiz(quiz: Quiz): Promise<any> {
    console.log('📝 Creating new quiz:', quiz);
    const newQuiz: Quiz = {
      ...quiz,
      _id: this.generateId(),
      created_at: new Date()
    };

    this.quizzes.push(newQuiz);
    this.saveToSession();
    this.saveQuizzesToStorage();
    console.log('✅ Quiz created successfully:', newQuiz);
    console.log('📊 Current quizzes in database:', this.quizzes);
    return newQuiz;
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    this.loadFromSession();
    this.loadQuizzesFromStorage();
    return this.quizzes.find(q => q.quiz_code === code && q.active) || null;
  }

  async submitQuiz(submission: QuizSubmission): Promise<any> {
    const newSubmission: QuizSubmission = {
      ...submission,
      _id: this.generateId(),
      submitted_at: new Date()
    };

    this.quizSubmissions.push(newSubmission);
    // Reflect quiz score into marks for the student's subject
    try {
      const quiz = this.quizzes.find(q => q._id === submission.quiz_id);
      // Map submitted student id back to student_id code if needed
      let studentIdCode = submission.student_id;
      const studentByInternal = this.students.find(s => s._id === submission.student_id);
      if (studentByInternal) {
        studentIdCode = studentByInternal.student_id;
      }
      if (quiz) {
        const existing = this.marks.find(m => m.student_id === studentIdCode && m.subject_code === quiz.subject_code);
        if (existing) {
          existing.quiz_marks = submission.score;
          existing.teacher_id = quiz.teacher_id;
          existing.updated_at = new Date();
        } else {
          this.marks.push({
            _id: this.generateId(),
            student_id: studentIdCode,
            subject_code: quiz.subject_code,
            test1: 0,
            test2: 0,
            cat1: 0,
            mid_semester: 0,
            quiz_marks: submission.score,
            teacher_id: quiz.teacher_id,
            updated_at: new Date()
          });
        }
      }
    } catch {}
    this.saveToSession();
    return newSubmission;
  }

  async getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
    this.loadFromSession();
    this.loadQuizzesFromStorage();
    return this.quizzes
      .filter(q => q.teacher_id === teacherId)
      .sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
  }

  async getQuizSubmissions(quizId: string): Promise<QuizSubmission[]> {
    this.loadFromSession();
    const submissions = this.quizSubmissions.filter(s => s.quiz_id === quizId);
    
    // Add student information
    return submissions.map(submission => {
      const student = this.students.find(s => s.student_id === submission.student_id);
      return {
        ...submission,
        students: student ? {
          name: student.name,
          student_id: student.student_id
        } : undefined
      };
    });
  }

  async getMarksForTeacher(teacherId: string): Promise<any[]> {
    this.loadFromSession();
    const teacherMarks = this.marks.filter(m => m.teacher_id === teacherId);
    
    // Add student information
    return teacherMarks.map(mark => {
      const student = this.students.find(s => s.student_id === mark.student_id);
      return {
        ...mark,
        students: student ? {
          name: student.name,
          student_id: student.student_id,
          class: student.class
        } : undefined
      };
    });
  }

  async getAttendanceBySubject(subjectCode: string): Promise<Attendance[]> {
    const subjectAttendance = this.attendance.filter(a => a.subject_code === subjectCode);
    
    // Add student information
    const attendanceWithStudents = subjectAttendance.map(attendance => {
      const student = this.students.find(s => s.student_id === attendance.student_id);
      return {
        ...attendance,
        students: student ? {
          name: student.name,
          student_id: student.student_id
        } : undefined
      };
    });

    return attendanceWithStudents.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getActiveQuizzesForClass(className: string): Promise<Quiz[]> {
    this.loadQuizzesFromStorage();
    const quizzes = this.quizzes
      .filter(q => q.class === className && q.active);
    console.log('📣 Fetching active quizzes for class:', className, quizzes);
    return quizzes.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Additional methods for data management
  async clearAllData() {
    this.teachers = [];
    this.students = [];
    this.timetables = [];
    this.marks = [];
    this.attendance = [];
    this.quizzes = [];
    this.quizSubmissions = [];
    this.initializeDefaultData();
  }

  async getDataStats() {
    return {
      teachers: this.teachers.length,
      students: this.students.length,
      timetables: this.timetables.length,
      marks: this.marks.length,
      attendance: this.attendance.length,
      quizzes: this.quizzes.length,
      quizSubmissions: this.quizSubmissions.length
    };
  }
}

