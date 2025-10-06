import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MongoDBService, Quiz, QuizSubmission } from '../../services/mongodb.service';

@Component({
  selector: 'app-quiz-take',
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-take.component.html',
  styleUrls: ['./quiz-take.component.css']
})
export class QuizTakeComponent implements OnInit {
  quizCode = '';
  quiz: Quiz | null = null;
  currentUser: any;

  answers: { [key: number]: number } = {};
  submitted = false;
  score = 0;

  loading = false;
  error = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mongodb: MongoDBService
  ) {}

  ngOnInit() {
    this.currentUser = this.mongodb.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'student') {
      this.error = 'Please login as a student to take the quiz';
      return;
    }

    this.quizCode = this.route.snapshot.paramMap.get('code') || '';
    this.loadQuiz();
  }

  async loadQuiz() {
    if (!this.quizCode) {
      this.error = 'Invalid quiz code';
      return;
    }

    this.loading = true;
    try {
      this.quiz = await this.mongodb.getQuizByCode(this.quizCode);
      if (!this.quiz) {
        this.error = 'Quiz not found or has expired';
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to load quiz';
    } finally {
      this.loading = false;
    }
  }

  selectAnswer(questionIndex: number, optionIndex: number) {
    this.answers[questionIndex] = optionIndex;
  }

  async submitQuiz() {
    if (!this.quiz || !this.currentUser) return;

    const unanswered = this.quiz.questions.length - Object.keys(this.answers).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    this.loading = true;
    try {
      this.score = this.calculateScore();

      const submission: QuizSubmission = {
        quiz_id: this.quiz._id!,
        student_id: this.currentUser._id,
        answers: this.answers,
        score: this.score
      };

      await this.mongodb.submitQuiz(submission);

      this.submitted = true;
      this.message = `Quiz submitted successfully! You scored ${this.score}%. Your attendance has been marked as Present and marks have been recorded automatically.`;
    } catch (err: any) {
      this.error = err.message || 'Failed to submit quiz';
    } finally {
      this.loading = false;
    }
  }

  calculateScore(): number {
    if (!this.quiz) return 0;

    let correct = 0;
    this.quiz.questions.forEach((question: any, index: number) => {
      if (this.answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    return Math.round((correct / this.quiz.questions.length) * 100);
  }

  goToDashboard() {
    this.router.navigate(['/student']);
  }
}
