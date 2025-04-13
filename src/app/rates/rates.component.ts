import { Component } from '@angular/core';
import {CurrencyConverterComponent} from '../currency-converter/currency-converter.component';

@Component({
  selector: 'app-rates',
  imports: [
    CurrencyConverterComponent
  ],
  templateUrl: './rates.component.html',
  styleUrl: './rates.component.scss'
})
export class RatesComponent {

}
