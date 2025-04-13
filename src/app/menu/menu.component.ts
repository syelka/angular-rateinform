import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    RouterLink,
    NgIf,
    NgClass,
  ]
})
export class MenuComponent {
  isLoggedIn: boolean = false;
  username: string = '';
  menuOpen = false;

  constructor() {
    const user = localStorage.getItem('user');
    if (user) {
      this.isLoggedIn = true;
      this.username = JSON.parse(user).username;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
