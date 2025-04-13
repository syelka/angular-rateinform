import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private storageKey = 'users';

  register(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    console.log('User registered:', user);
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); // Save logged-in user
      return true;
    }
    return false;
  }

  getUsers(): User[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }
}
