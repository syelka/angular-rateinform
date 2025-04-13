import { Component, OnInit } from '@angular/core';
import { currencies } from '../data/currencies';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    NgIf,
    NgForOf,
    FormsModule,
    MatInput,
    DecimalPipe
  ]
})
export class CurrencyConverterComponent implements OnInit {
  amount: number = 1;
  fromCurrency: string = 'Euro'; // Default source currency
  toCurrency: string = 'US Dollar'; // Default target currency
  convertedAmount: number = 0;
  currencies = currencies;

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.favoriteCurrency) {
        this.toCurrency = userData.favoriteCurrency; // Set favorite currency as default
      }
    }
    this.convert(); // Perform initial conversion
  }

  convert(): void {
    const source = this.currencies.find((c) => c.name === this.fromCurrency);
    const target = this.currencies.find((c) => c.name === this.toCurrency);

    if (source && target) {
      this.convertedAmount = (this.amount * target.price) / source.price;
    }
  }
}
