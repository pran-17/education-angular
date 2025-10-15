import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MongoDBService, Marks, Attendance, Quiz } from '../../services/mongodb.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  activeTab: 'profile' | 'marks' | 'attendance' | 'quizzes' = 'profile';
  currentUser: any;

  marks: Marks[] = [];
  attendance: Attendance[] = [];
  quizzes: Quiz[] = [];

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
      this.marks = await this.mongodb.getStudentMarks(this.currentUser.student_id);
      console.log('📥 Loaded student marks:', this.marks);
      this.attendance = await this.mongodb.getStudentAttendance(this.currentUser.student_id);
      console.log('📥 Loaded student attendance:', this.attendance);
      this.quizzes = await this.mongodb.getActiveQuizzesForClass(this.currentUser.class);
      console.log('📥 Loaded active quizzes for class:', this.currentUser.class, this.quizzes);
    } catch (error: any) {
      this.message = error.message;
    } finally {
      this.loading = false;
    }
  }

  setActiveTab(tab: 'profile' | 'marks' | 'attendance' | 'quizzes') {
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

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.mongodb.logout();
    this.router.navigate(['/home']);
  }

  getOverallAttendanceRate(): number {
    if (this.attendance.length === 0) return 0;
    const presentCount = this.attendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / this.attendance.length) * 100);
  }

  getGrade(totalMarks: number): string {
    if (totalMarks >= 90) return 'A';
    if (totalMarks >= 80) return 'B';
    if (totalMarks >= 70) return 'C';
    if (totalMarks >= 60) return 'D';
    return 'F';
  }
}
