// src/app/menu/menu.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgClass, NgIf } from '@angular/common'; // CommonModule szükséges
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user-profile';

@Component({
  selector: 'app-menu',
  standalone: true, // Ha standalone
  imports: [
    CommonModule, // Hozzáadva
    RouterLink,
    NgIf, // NgIf már a CommonModule része
    NgClass
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username: string | undefined = '';
  menuOpen = false;

  private authService: AuthService = inject(AuthService);
  private authSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.authSubscription.add(
      this.authService.isLoggedIn$.subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
      })
    );

    this.authSubscription.add(
      this.authService.userProfile$.subscribe(profile => {
        this.username = profile?.username;
      })
    );
  }


  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  async logout(): Promise<void> { // Kijelentkezés funkció hozzáadása
    this.toggleMenu(); // Menü bezárása kijelentkezéskor (mobil nézetben)
    await this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
