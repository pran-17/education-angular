import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MongoDBService } from '../../services/mongodb.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  email = 'praneeth';
  password = '17';
  error = '';
  loading = false;

  constructor(private mongodb: MongoDBService, private router: Router) {}

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      await this.mongodb.adminLogin(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch (e: any) {
      this.error = e?.message || 'Invalid credentials';
    } finally {
      this.loading = false;
    }
  }
}



