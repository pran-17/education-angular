import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MongoDBService, Marks, Attendance } from '../../services/mongodb.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  activeTab: 'profile' | 'marks' | 'attendance' = 'profile';
  currentUser: any;

  marks: Marks[] = [];
  attendance: Attendance[] = [];

  loading = false;
  message = '';

  constructor(
    private mongodb: MongoDBService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.mongodb.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'student') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      this.marks = await this.mongodb.getStudentMarks(this.currentUser._id);
      this.attendance = await this.mongodb.getStudentAttendance(this.currentUser._id);
    } catch (error: any) {
      this.message = error.message;
    } finally {
      this.loading = false;
    }
  }

  setActiveTab(tab: 'profile' | 'marks' | 'attendance') {
    this.activeTab = tab;
  }

  getTotalMarks(mark: Marks): number {
    return (mark.test1 || 0) + (mark.test2 || 0) + (mark.cat1 || 0) +
           (mark.mid_semester || 0) + (mark.quiz_marks || 0);
  }

  getAttendancePercentage(subjectCode: string): number {
    const subjectAttendance = this.attendance.filter(a => a.subject_code === subjectCode);
    if (subjectAttendance.length === 0) return 0;

    const presentCount = subjectAttendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / subjectAttendance.length) * 100);
  }

  getAttendanceBySubject(): { [key: string]: Attendance[] } {
    const grouped: { [key: string]: Attendance[] } = {};
    this.attendance.forEach(att => {
      if (!grouped[att.subject_code]) {
        grouped[att.subject_code] = [];
      }
      grouped[att.subject_code].push(att);
    });
    return grouped;
  }

  getPresentCount(): number {
    return this.attendance.filter(a => a.status === 'Present').length;
  }

  getTotalMarksSum(): number {
    return this.marks.reduce((sum, m) => sum + this.getTotalMarks(m), 0);
  }

  getSubjectPresentCount(attendances: Attendance[]): number {
    return attendances.filter(a => a.status === 'Present').length;
  }

  getSubjectAbsentCount(attendances: Attendance[]): number {
    return attendances.filter(a => a.status === 'Absent').length;
  }

  logout() {
    this.mongodb.logout();
    this.router.navigate(['/home']);
  }
}
