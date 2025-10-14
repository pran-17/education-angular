import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./components/admin/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'teacher',
    loadComponent: () => import('./components/teacher/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['teacher'] }
  },
  {
    path: 'student',
    loadComponent: () => import('./components/student/student-dashboard.component').then(m => m.StudentDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['student'] }
  },
  {
    path: 'quiz/:code',
    loadComponent: () => import('./components/quiz/quiz-take.component').then(m => m.QuizTakeComponent)
  }
];
