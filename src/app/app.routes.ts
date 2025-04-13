import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {RatesComponent} from './rates/rates.component';
import {RegisterComponent} from './register/register.component';
import {ProfileComponent} from './profile/profile.component';
import {CurrencyConverterComponent} from './currency-converter/currency-converter.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    component: HomeComponent
  },
  {
    path: 'login',
    title: 'Login',
    component: LoginComponent
  },
  {
    path: 'rates',
    title: 'Rates',
    component: RatesComponent
  },
  {
    path: 'register',
    title: 'Register',
    component: RegisterComponent
  },
  {
    path: 'profile',
    title: 'Profile',
    component: ProfileComponent
  },
  {
    path: 'currency-converter',
    title: 'Currency Converter',
    component: CurrencyConverterComponent
  }
];
