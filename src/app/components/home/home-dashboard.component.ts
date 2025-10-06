import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-dashboard',
  imports: [CommonModule],
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css']
})
export class HomeDashboardComponent {

  constructor(private router: Router) {}

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  navigateToTeacher() {
    this.router.navigate(['/login']);
  }

  navigateToStudent() {
    this.router.navigate(['/login']);
  }
}


