import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MongoDBService, Marks, Quiz } from '../../services/mongodb.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  activeTab: 'profile' | 'marks' | 'students' | 'quiz' = 'profile';
  currentUser: any;

  studentMarks: any[] = [];
  students: any[] = [];
  quizzes: Quiz[] = [];

  selectedStudent: any = null;
  editingMarks: any = null;

  newQuiz = {
    subject_code: '',
    class: '',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]
  };

  qrCodeDataUrl = '';
  quizLink = '';

  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private mongodb: MongoDBService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.mongodb.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'teacher') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  async loadData() {
    try {
      this.studentMarks = await this.mongodb.getMarksForTeacher(this.currentUser._id);
      this.students = await this.mongodb.getStudents();
      this.quizzes = await this.mongodb.getTeacherQuizzes(this.currentUser._id);
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    }
  }

  setActiveTab(tab: 'profile' | 'marks' | 'students' | 'quiz') {
    this.activeTab = tab;
    this.message = '';
  }

  editMarks(mark: any) {
    this.editingMarks = { ...mark };
  }

  async saveMarks() {
    if (!this.editingMarks) return;

    this.loading = true;
    try {
      await this.mongodb.updateMarks(this.editingMarks._id, {
        test1: this.editingMarks.test1,
        test2: this.editingMarks.test2,
        cat1: this.editingMarks.cat1,
        mid_semester: this.editingMarks.mid_semester
      });

      this.showMessage('Marks updated successfully!', 'success');
      this.editingMarks = null;
      this.studentMarks = await this.mongodb.getMarksForTeacher(this.currentUser._id);
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  cancelEdit() {
    this.editingMarks = null;
  }

  addQuestion() {
    this.newQuiz.questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  }

  removeQuestion(index: number) {
    if (this.newQuiz.questions.length > 1) {
      this.newQuiz.questions.splice(index, 1);
    }
  }

  async generateQuiz() {
    if (!this.validateQuiz()) return;

    this.loading = true;
    try {
      const quizCode = this.generateQuizCode();
      const quiz: Quiz = {
        subject_code: this.newQuiz.subject_code,
        teacher_id: this.currentUser._id,
        class: this.newQuiz.class,
        quiz_code: quizCode,
        questions: this.newQuiz.questions,
        active: true
      };

      await this.mongodb.createQuiz(quiz);

      this.quizLink = `${window.location.origin}/quiz/${quizCode}`;
      await this.generateQRCode(this.quizLink);

      this.showMessage('Quiz generated successfully!', 'success');
      this.quizzes = await this.mongodb.getTeacherQuizzes(this.currentUser._id);
    } catch (error: any) {
      this.showMessage(error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  async generateQRCode(url: string) {
    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  }

  generateQuizCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  validateQuiz(): boolean {
    if (!this.newQuiz.subject_code || !this.newQuiz.class) {
      this.showMessage('Subject code and class are required', 'error');
      return false;
    }

    for (const q of this.newQuiz.questions) {
      if (!q.question || q.options.some(opt => !opt)) {
        this.showMessage('All questions and options must be filled', 'error');
        return false;
      }
    }

    return true;
  }

  copyQuizLink() {
    navigator.clipboard.writeText(this.quizLink);
    this.showMessage('Quiz link copied to clipboard!', 'success');
  }

  resetQuizForm() {
    this.newQuiz = {
      subject_code: '',
      class: '',
      questions: [
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    };
    this.qrCodeDataUrl = '';
    this.quizLink = '';
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  logout() {
    this.mongodb.logout();
    this.router.navigate(['/home']);
  }
}
