import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MongoDBService, Teacher, Student, Timetable } from '../../services/mongodb.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'teachers' | 'students' | 'timetable' = 'teachers';

  teachers: Teacher[] = [];
  students: Student[] = [];
  timetables: Timetable[] = [];

  newTeacher: Teacher = {
    teacher_id: '',
    name: '',
    email: '',
    subject: '',
    password: ''
  };

  newStudent: Student = {
    student_id: '',
    name: '',
    email: '',
    class: '',
    password: ''
  };

  newTimetable: Timetable = {
    subject_code: '',
    subject_name: '',
    credit_hours: 0,
    teacher_id: '',
    class: ''
  };

  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private mongodb: MongoDBService,
    private router: Router
  ) {}

  ngOnInit() {
    // Admin access does not require login
    console.log('🛠️ Admin panel accessed without login');
    this.loadData();
  }

  async loadData() {
    try {
      this.teachers = await this.mongodb.getTeachers();
      console.log('📥 Loaded teachers:', this.teachers);
      this.students = await this.mongodb.getStudents();
      console.log('📥 Loaded students:', this.students);
      this.timetables = await this.mongodb.getTimetables();
      console.log('📥 Loaded timetables:', this.timetables);
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    }
  }

  setActiveTab(tab: 'teachers' | 'students' | 'timetable') {
    this.activeTab = tab;
    this.message = '';
  }

  async addTeacher() {
    if (!this.validateTeacher()) return;

    this.loading = true;
    try {
      await this.mongodb.addTeacher(this.newTeacher);
      this.showMessage('Teacher added successfully!', 'success');
      this.resetTeacherForm();
      this.teachers = await this.mongodb.getTeachers();
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  async addStudent() {
    if (!this.validateStudent()) return;

    this.loading = true;
    try {
      await this.mongodb.addStudent(this.newStudent);
      this.showMessage('Student added successfully!', 'success');
      this.resetStudentForm();
      this.students = await this.mongodb.getStudents();
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  async addTimetable() {
    if (!this.validateTimetable()) return;

    this.loading = true;
    try {
      await this.mongodb.addTimetable(this.newTimetable);
      this.showMessage('Timetable added successfully!', 'success');
      this.resetTimetableForm();
      this.timetables = await this.mongodb.getTimetables();
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  validateTeacher(): boolean {
    if (!this.newTeacher.teacher_id || !this.newTeacher.name ||
        !this.newTeacher.email || !this.newTeacher.subject || !this.newTeacher.password) {
      this.showMessage('All fields are required', 'error');
      return false;
    }
    return true;
  }

  validateStudent(): boolean {
    if (!this.newStudent.student_id || !this.newStudent.name ||
        !this.newStudent.email || !this.newStudent.class || !this.newStudent.password) {
      this.showMessage('All fields are required', 'error');
      return false;
    }
    return true;
  }

  validateTimetable(): boolean {
    if (!this.newTimetable.subject_code || !this.newTimetable.subject_name ||
        !this.newTimetable.teacher_id || !this.newTimetable.class) {
      this.showMessage('All fields are required', 'error');
      return false;
    }
    return true;
  }

  resetTeacherForm() {
    this.newTeacher = {
      teacher_id: '',
      name: '',
      email: '',
      subject: '',
      password: ''
    };
  }

  resetStudentForm() {
    this.newStudent = {
      student_id: '',
      name: '',
      email: '',
      class: '',
      password: ''
    };
  }

  resetTimetableForm() {
    this.newTimetable = {
      subject_code: '',
      subject_name: '',
      credit_hours: 0,
      teacher_id: '',
      class: ''
    };
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  getTeacherName(timetable: any): string {
    return timetable.teachers?.name || 'N/A';
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.mongodb.logout();
    this.router.navigate(['/home']);
  }
}
