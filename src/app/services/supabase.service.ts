import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthSession } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import * as bcrypt from 'bcryptjs';

export interface Teacher {
  id?: string;
  teacher_id: string;
  name: string;
  email: string;
  subject: string;
  password?: string;
  password_hash?: string;
  created_at?: string;
  created_by?: string;
}

export interface Student {
  id?: string;
  student_id: string;
  name: string;
  email: string;
  class: string;
  password?: string;
  password_hash?: string;
  created_at?: string;
  created_by?: string;
}

export interface Timetable {
  id?: string;
  subject_code: string;
  subject_name: string;
  credit_hours: number;
  teacher_id: string;
  class: string;
  created_at?: string;
}

export interface Marks {
  id?: string;
  student_id: string;
  subject_code: string;
  test1: number;
  test2: number;
  cat1: number;
  mid_semester: number;
  quiz_marks: number;
  teacher_id?: string;
  updated_at?: string;
}

export interface Attendance {
  id?: string;
  student_id: string;
  subject_code: string;
  date: string;
  status: string;
  marked_via?: string;
  created_at?: string;
}

export interface Quiz {
  id?: string;
  subject_code: string;
  teacher_id: string;
  class: string;
  quiz_code: string;
  questions: any[];
  active: boolean;
  created_at?: string;
  expires_at?: string;
}

export interface QuizSubmission {
  id?: string;
  quiz_id: string;
  student_id: string;
  answers: any;
  score: number;
  submitted_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const supabaseUrl = 'https://goluuwfhndvseflntddh.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbHV1d2ZobmR2c2VmbG50ZGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzUyMjksImV4cCI6MjA3NTE1MTIyOX0.fQO5YmEwYqYgtHJqULwvxRO5K2rgQlB6OZ_LewDTGwE';

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.loadUser();
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

  async adminLogin(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Invalid credentials');
    }

    const userData = { ...data, role: 'admin' };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    return userData;
  }

  async teacherLogin(email: string, teacherId: string, password: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Invalid credentials or teacher not found in system');
    }

    const userData = { ...data, role: 'teacher' };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    return userData;
  }

  async studentLogin(email: string, studentId: string, password: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Invalid credentials or student not found in system');
    }

    const userData = { ...data, role: 'student' };
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

    const { data, error } = await this.supabase
      .from('teachers')
      .insert([{ ...teacherData, password_hash: passwordHash }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addStudent(student: Student): Promise<any> {
    const passwordHash = await this.hashPassword(student.password || '');
    const { password, ...studentData } = student;

    const { data, error } = await this.supabase
      .from('students')
      .insert([{ ...studentData, password_hash: passwordHash }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTeachers(): Promise<Teacher[]> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStudents(): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addTimetable(timetable: Timetable): Promise<any> {
    const { data, error } = await this.supabase
      .from('timetables')
      .insert([timetable])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTimetables(classFilter?: string): Promise<Timetable[]> {
    let query = this.supabase
      .from('timetables')
      .select('*, teachers(name, email, subject)');

    if (classFilter) {
      query = query.eq('class', classFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStudentMarks(studentId: string): Promise<Marks[]> {
    const { data, error } = await this.supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;
    return data || [];
  }

  async updateMarks(marksId: string, marks: Partial<Marks>): Promise<any> {
    const { data, error } = await this.supabase
      .from('marks')
      .update(marks)
      .eq('id', marksId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createMarks(marks: Marks): Promise<any> {
    const { data, error } = await this.supabase
      .from('marks')
      .insert([marks])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createQuiz(quiz: Quiz): Promise<any> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .insert([quiz])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('quiz_code', code)
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async submitQuiz(submission: QuizSubmission): Promise<any> {
    const { data, error } = await this.supabase
      .from('quiz_submissions')
      .insert([submission])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQuizSubmissions(quizId: string): Promise<QuizSubmission[]> {
    const { data, error } = await this.supabase
      .from('quiz_submissions')
      .select('*, students(name, student_id)')
      .eq('quiz_id', quizId);

    if (error) throw error;
    return data || [];
  }

  async getMarksForTeacher(teacherId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('marks')
      .select('*, students(name, student_id, class)')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return data || [];
  }

  async getAttendanceBySubject(subjectCode: string): Promise<Attendance[]> {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('*, students(name, student_id)')
      .eq('subject_code', subjectCode)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
