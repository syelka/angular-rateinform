import { Component, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    RouterLink
  ]
})
export class LoginComponent {
  @Input() users: any[] = [];

  email: string = '';
  password: string = '';

  constructor(private userService: UserService, private router: Router) {}

  onLogin(): void {
    const isLoggedIn = this.userService.login(this.email, this.password);
    if (isLoggedIn) {
      this.router.navigate(['/']);
    } else {
      alert('Invalid email or password!');
    }
  }
}
