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

  constructor() {
    this.loadUser();
    this.initializeDefaultData();
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
    // Initialize with some default admin data
    if (this.admins.length === 0) {
      this.admins.push({
        _id: 'admin1',
        email: 'admin@system.com',
        name: 'System Administrator',
        created_at: new Date()
      });
    }
  }

  async adminLogin(email: string, password: string): Promise<any> {
    const admin = this.admins.find(a => a.email === email);
    
    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const userData = { ...admin, role: 'admin' };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
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
    return userData;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  async addTeacher(teacher: Teacher): Promise<any> {
    const passwordHash = await this.hashPassword(teacher.password || '');
    const { password, ...teacherData } = teacher;

    const newTeacher: Teacher = {
      ...teacherData,
      _id: this.generateId(),
      password_hash: passwordHash,
      created_at: new Date()
    };

    this.teachers.push(newTeacher);
    return newTeacher;
  }

  async addStudent(student: Student): Promise<any> {
    const passwordHash = await this.hashPassword(student.password || '');
    const { password, ...studentData } = student;

    const newStudent: Student = {
      ...studentData,
      _id: this.generateId(),
      password_hash: passwordHash,
      created_at: new Date()
    };

    this.students.push(newStudent);
    return newStudent;
  }

  async getTeachers(): Promise<Teacher[]> {
    return [...this.teachers].sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }

  async getStudents(): Promise<Student[]> {
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
    return newTimetable;
  }

  async getTimetables(classFilter?: string): Promise<Timetable[]> {
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

    return this.marks[index];
  }

  async createMarks(marks: Marks): Promise<any> {
    const newMarks: Marks = {
      ...marks,
      _id: this.generateId(),
      updated_at: new Date()
    };

    this.marks.push(newMarks);
    return newMarks;
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    return this.attendance
      .filter(a => a.student_id === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createQuiz(quiz: Quiz): Promise<any> {
    const newQuiz: Quiz = {
      ...quiz,
      _id: this.generateId(),
      created_at: new Date()
    };

    this.quizzes.push(newQuiz);
    return newQuiz;
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    return this.quizzes.find(q => q.quiz_code === code && q.active) || null;
  }

  async submitQuiz(submission: QuizSubmission): Promise<any> {
    const newSubmission: QuizSubmission = {
      ...submission,
      _id: this.generateId(),
      submitted_at: new Date()
    };

    this.quizSubmissions.push(newSubmission);
    return newSubmission;
  }

  async getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
    return this.quizzes
      .filter(q => q.teacher_id === teacherId)
      .sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
  }

  async getQuizSubmissions(quizId: string): Promise<QuizSubmission[]> {
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

