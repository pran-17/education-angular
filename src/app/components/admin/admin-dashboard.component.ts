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
  currentDate = new Date();
  
  // Search and filter properties
  teacherSearchTerm = '';
  studentSearchTerm = '';
  filteredTeachers: Teacher[] = [];
  filteredStudents: Student[] = [];

  constructor(
    private mongodb: MongoDBService,
    private router: Router
  ) {}

  ngOnInit() {
    const current = this.mongodb.getCurrentUser();
    if (!current || current.role !== 'admin') {
      this.router.navigate(['/admin-login']);
      return;
    }
    this.loadData();
    this.filterTeachers();
    this.filterStudents();
  }

  async loadData() {
    try {
      this.teachers = await this.mongodb.getTeachers();
      console.log('📥 Loaded teachers:', this.teachers);
      this.students = await this.mongodb.getStudents();
      console.log('📥 Loaded students:', this.students);
      this.timetables = await this.mongodb.getTimetables();
      console.log('📥 Loaded timetables:', this.timetables);
      
      // Update filtered lists after loading data
      this.filterTeachers();
      this.filterStudents();
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
      this.filterTeachers(); // Update the filtered list
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
      this.filterStudents(); // Update the filtered list
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

  getTotalClasses(): number {
    const uniqueClasses = new Set(this.students.map(s => s.class));
    return uniqueClasses.size;
  }

  async editTeacher(teacher: Teacher) {
    const newName = prompt('Enter new name:', teacher.name);
    const newEmail = prompt('Enter new email:', teacher.email);
    const newSubject = prompt('Enter new subject:', teacher.subject);
    
    if (newName && newEmail && newSubject) {
      this.loading = true;
      try {
        await this.mongodb.updateTeacher(teacher._id!, {
          name: newName,
          email: newEmail,
          subject: newSubject
        });
        this.showMessage('Teacher updated successfully!', 'success');
        this.teachers = await this.mongodb.getTeachers();
        this.filterTeachers();
      } catch (error: any) {
        this.showMessage(error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  async deleteTeacher(teacher: Teacher) {
    if (confirm(`Are you sure you want to delete teacher ${teacher.name}?`)) {
      this.loading = true;
      try {
        await this.mongodb.deleteTeacher(teacher._id!);
        this.showMessage('Teacher deleted successfully!', 'success');
        this.teachers = await this.mongodb.getTeachers();
        this.filterTeachers();
      } catch (error: any) {
        this.showMessage(error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  async editStudent(student: Student) {
    const newName = prompt('Enter new name:', student.name);
    const newEmail = prompt('Enter new email:', student.email);
    const newClass = prompt('Enter new class:', student.class);
    
    if (newName && newEmail && newClass) {
      this.loading = true;
      try {
        await this.mongodb.updateStudent(student._id!, {
          name: newName,
          email: newEmail,
          class: newClass
        });
        this.showMessage('Student updated successfully!', 'success');
        this.students = await this.mongodb.getStudents();
        this.filterStudents();
      } catch (error: any) {
        this.showMessage(error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  async deleteStudent(student: Student) {
    if (confirm(`Are you sure you want to delete student ${student.name}?`)) {
      this.loading = true;
      try {
        await this.mongodb.deleteStudent(student._id!);
        this.showMessage('Student deleted successfully!', 'success');
        this.students = await this.mongodb.getStudents();
        this.filterStudents();
      } catch (error: any) {
        this.showMessage(error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  filterTeachers() {
    if (!this.teacherSearchTerm.trim()) {
      this.filteredTeachers = [...this.teachers];
    } else {
      const searchTerm = this.teacherSearchTerm.toLowerCase();
      this.filteredTeachers = this.teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm) ||
        teacher.subject.toLowerCase().includes(searchTerm) ||
        teacher.teacher_id.toLowerCase().includes(searchTerm)
      );
    }
  }

  filterStudents() {
    if (!this.studentSearchTerm.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      const searchTerm = this.studentSearchTerm.toLowerCase();
      this.filteredStudents = this.students.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.class.toLowerCase().includes(searchTerm) ||
        student.student_id.toLowerCase().includes(searchTerm)
      );
    }
  }

  onTeacherSearchChange() {
    this.filterTeachers();
  }

  onStudentSearchChange() {
    this.filterStudents();
  }
}
