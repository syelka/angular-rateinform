export interface Currency {
  name: string;
  symbol: string;
  price: number;
}

export const currencies: Currency[] = [
  { name: 'Euro', symbol: '€', price: 1 },
  { name: 'US Dollar', symbol: '$', price: 1.1 },
  { name: 'British Pound', symbol: '£', price: 0.85 },
  { name: 'Japanese Yen', symbol: '¥', price: 130 },
  { name: 'Swiss Franc', symbol: 'CHF', price: 1.05 },
  { name: 'Canadian Dollar', symbol: 'C$', price: 1.45 },
  { name: 'Australian Dollar', symbol: 'A$', price: 1.6 },
  { name: 'Chinese Yuan', symbol: '¥', price: 7.5 },
  { name: 'Indian Rupee', symbol: '₹', price: 90 },
  { name: 'South Korean Won', symbol: '₩', price: 1400 },
  { name: 'Hungarian Forint', symbol: 'Ft', price: 375 },
];
