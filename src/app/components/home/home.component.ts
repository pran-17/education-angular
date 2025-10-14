import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToAdmin() {
    this.router.navigate(['/admin-login']);
  }

  navigateToTeacher() {
    this.router.navigate(['/login'], { queryParams: { role: 'teacher' } });
  }

  navigateToStudent() {
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
  }
}

