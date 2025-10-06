import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home-dashboard.component').then(m => m.HomeDashboardComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home-dashboard.component').then(m => m.HomeDashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'teacher',
    loadComponent: () => import('./components/teacher/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
  },
  {
    path: 'student',
    loadComponent: () => import('./components/student/student-dashboard.component').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'quiz/:code',
    loadComponent: () => import('./components/quiz/quiz-take.component').then(m => m.QuizTakeComponent)
  }
];
