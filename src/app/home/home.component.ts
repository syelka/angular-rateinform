import { Component, OnInit } from '@angular/core';
import { currencies } from '../data/currencies';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    DecimalPipe,
    NgIf,
    NgForOf
  ]
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  selectedCurrencies: string[] = [];
  favoriteCurrency: string = '';
  currencyTable: { name: string; symbol: string; convertedAmount: number }[] = [];
  currencies = currencies;

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.isLoggedIn = true;
      this.selectedCurrencies = userData.selectedCurrencies || [];
      this.favoriteCurrency = userData.favoriteCurrency || '';
      this.calculateConversions();
    }
  }

  calculateConversions(): void {
    const favoriteCurrencyData = this.currencies.find(
      (c) => c.name === this.favoriteCurrency
    );

    if (favoriteCurrencyData) {
      this.currencyTable = this.selectedCurrencies
        .map((currencyName) => {
          const currencyData = this.currencies.find(
            (c) => c.name === currencyName
          );
          if (currencyData) {
            const convertedAmount =
              favoriteCurrencyData.price / currencyData.price;
            return {
              name: currencyData.name,
              symbol: currencyData.symbol,
              convertedAmount,
            };
          }
          return null;
        })
        .filter((entry) => entry !== null) as {
        name: string;
        symbol: string;
        convertedAmount: number;
      }[];
    }
  }
}
