import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MongoDBService } from '../../services/mongodb.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  selectedRole: 'admin' | 'teacher' | 'student' = 'admin';
  email = '';
  password = '';
  teacherId = '';
  studentId = '';
  error = '';
  loading = false;

  constructor(
    private mongodb: MongoDBService,
    private router: Router
  ) {
    // Check for role from query params
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role && ['admin', 'teacher', 'student'].includes(role)) {
      this.selectedRole = role as 'admin' | 'teacher' | 'student';
    }
  }

  async login() {
    this.error = '';
    this.loading = true;

    try {
      if (this.selectedRole === 'admin') {
        await this.mongodb.adminLogin(this.email, this.password);
        this.router.navigate(['/admin']);
      } else if (this.selectedRole === 'teacher') {
        if (!this.teacherId) {
          this.error = 'Teacher ID is required';
          return;
        }
        await this.mongodb.teacherLogin(this.email, this.teacherId, this.password);
        this.router.navigate(['/teacher']);
      } else if (this.selectedRole === 'student') {
        if (!this.studentId) {
          this.error = 'Student ID is required';
          return;
        }
        await this.mongodb.studentLogin(this.email, this.studentId, this.password);
        this.router.navigate(['/student']);
      }
    } catch (err: any) {
      this.error = err.message || 'Login failed. Please check your credentials.';
    } finally {
      this.loading = false;
    }
  }

  selectRole(role: 'admin' | 'teacher' | 'student') {
    this.selectedRole = role;
    this.error = '';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
