import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MongoDBService } from '../../services/mongodb.service';

interface Quiz {
  _id?: string;
  subject_code: string;
  teacher_id: string;
  class: string;
  quiz_code: string;
  questions: Question[];
  active: boolean;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSubmission {
  quiz_id: string;
  student_id: string;
  answers: { [key: number]: number };
  score: number;
}

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-take.component.html',
  styleUrls: ['./quiz-take.component.css']
})
export class QuizTakeComponent implements OnInit {
  quiz: Quiz | null = null;
  quizCode: string = '';
  currentQuestionIndex: number = 0;
  answers: { [key: number]: number } = {};
  loading: boolean = false;
  submitted: boolean = false;
  score: number = 0;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mongodb: MongoDBService
  ) {}

  async ngOnInit() {
    this.quizCode = this.route.snapshot.paramMap.get('code') || '';
    this.currentUser = this.mongodb.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/home']);
      return;
    }

    if (this.quizCode) {
      await this.loadQuiz();
    }
  }

  async loadQuiz() {
    this.loading = true;
    try {
      this.quiz = await this.mongodb.getQuizByCode(this.quizCode);
      if (!this.quiz) {
        this.showMessage('Quiz not found or inactive', 'error');
        setTimeout(() => this.router.navigate(['/home']), 2000);
      }
    } catch (error: any) {
      this.showMessage('Error loading quiz: ' + error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  selectAnswer(questionIndex: number, answerIndex: number) {
    this.answers[questionIndex] = answerIndex;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < (this.quiz?.questions.length || 0) - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  async submitQuiz() {
    if (!this.quiz || !this.currentUser) return;

    const totalQuestions = this.quiz.questions.length;
    let correctAnswers = 0;

    // Calculate score
    this.quiz.questions.forEach((question, index) => {
      if (this.answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    this.score = Math.round((correctAnswers / totalQuestions) * 100);

    this.loading = true;
    try {
      const submission: QuizSubmission = {
        quiz_id: this.quiz._id!,
        student_id: this.currentUser.student_id,
        answers: this.answers,
        score: this.score
      };

      await this.mongodb.submitQuiz(submission);
      this.submitted = true;
      this.showMessage('Quiz submitted successfully!', 'success');
    } catch (error: any) {
      this.showMessage('Error submitting quiz: ' + error.message, 'error');
    } finally {
      this.loading = false;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  getCurrentQuestion() {
    return this.quiz?.questions[this.currentQuestionIndex];
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex === (this.quiz?.questions.length || 0) - 1;
  }

  isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  getProgress(): number {
    if (!this.quiz) return 0;
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}