import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private apiService = inject(ApiService);
  apiResponse: any = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.apiService.getStatus().subscribe({
      next: (res) => {
        console.log('Backend Data:', res);
        this.apiResponse = res; // Poora response save kar liya
        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.errorMessage = 'Failed to connect backend through tunnel!';
        this.isLoading = false;
      }
    });
  }
}