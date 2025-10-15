import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { HttpClient } from '@angular/common/http';

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

  private apiBase = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {
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
    const user = await this.http.post<any>(`${this.apiBase}/teachers/login`, { email, teacher_id: teacherId, password }).toPromise();
    if (!user) throw new Error('Invalid credentials');
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.recordLogin('teacher', user.teacher_id, email);
    return user;
  }

  async studentLogin(email: string, studentId: string, password: string): Promise<any> {
    const user = await this.http.post<any>(`${this.apiBase}/students/login`, { email, student_id: studentId, password }).toPromise();
    if (!user) throw new Error('Invalid credentials');
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.recordLogin('student', user.student_id, email);
    return user;
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
    const payload = { ...teacher, password: teacher.password } as any;
    const created = await this.http.post(`${this.apiBase}/teachers`, payload).toPromise();
    return created as any;
  }

  async addStudent(student: Student): Promise<any> {
    const payload = { ...student, password: student.password } as any;
    const created = await this.http.post(`${this.apiBase}/students`, payload).toPromise();
    return created as any;
  }

  async getTeachers(): Promise<Teacher[]> {
    const items = await this.http.get<Teacher[]>(`${this.apiBase}/teachers`).toPromise();
    return items || [];
  }

  async getStudents(): Promise<Student[]> {
    const items = await this.http.get<Student[]>(`${this.apiBase}/students`).toPromise();
    return items || [];
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<any> {
    const payload = { ...teacher, password: teacher.password } as any;
    return await this.http.put(`${this.apiBase}/teachers/${id}`, payload).toPromise();
  }

  async deleteTeacher(id: string): Promise<any> {
    return await this.http.delete(`${this.apiBase}/teachers/${id}`).toPromise();
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<any> {
    const payload = { ...student, password: student.password } as any;
    return await this.http.put(`${this.apiBase}/students/${id}`, payload).toPromise();
  }

  async deleteStudent(id: string): Promise<any> {
    return await this.http.delete(`${this.apiBase}/students/${id}`).toPromise();
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
    const payload = { ...quiz } as any;
    const created = await this.http.post(`${this.apiBase}/quizzes`, payload).toPromise();
    return created as any;
  }

  async getQuizzes(): Promise<Quiz[]> {
    const items = await this.http.get<Quiz[]>(`${this.apiBase}/quizzes`).toPromise();
    return items || [];
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    try {
      const quiz = await this.http.get<Quiz>(`${this.apiBase}/quizzes/code/${code}`).toPromise();
      return quiz || null;
    } catch (error) {
      return null;
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<any> {
    const payload = { ...submission } as any;
    return await this.http.post(`${this.apiBase}/quiz-submissions`, payload).toPromise();
  }



  async getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
    try {
      const quizzes = await this.http.get<Quiz[]>(`${this.apiBase}/quizzes/teacher/${teacherId}`).toPromise();
      return (quizzes || []).sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } catch (error) {
      console.error('Error fetching teacher quizzes:', error);
      return [];
    }
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
    try {
      const quizzes = await this.http.get<Quiz[]>(`${this.apiBase}/quizzes/class/${className}`).toPromise();
      console.log('📣 Fetching active quizzes for class:', className, quizzes);
      return (quizzes || []).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } catch (error) {
      console.error('Error fetching quizzes for class:', error);
      return [];
    }
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

