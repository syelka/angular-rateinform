import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { UserService } from '../services/user.service';
import { User } from '../models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatButton,
    MatInput,
  ],
})
export class RegisterComponent {
  @Output() userRegistered = new EventEmitter<User>();

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService) {}

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const newUser: User = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.userService.register(newUser);
    this.userRegistered.emit(newUser);
    alert('Registration successful!');
  }
}
