import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { NgForOf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { currencies } from '../data/currencies';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    MatButton,
    MatSelect,
    NgForOf,
  ],
})
export class ProfileComponent implements OnInit {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  selectedCurrencies: string[] = [];
  favoriteCurrency: string = '';
  currencies = currencies; // Use the imported data

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.username = userData.username || '';
      this.selectedCurrencies = userData.selectedCurrencies || [];
      this.favoriteCurrency = userData.favoriteCurrency || '';
    }
  }

  onSave(): void {
    if (this.password && this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const updatedUser = {
      username: this.username,
      selectedCurrencies: this.selectedCurrencies,
      favoriteCurrency: this.favoriteCurrency,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Profile updated successfully!');
  }

  onLogout(): void {
    localStorage.removeItem('user');
    alert('Logged out successfully!');
    window.location.reload();
  }
}
