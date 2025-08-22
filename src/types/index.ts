export interface Account {
  id: string;
  name: string;
  cbu: string;
  alias: string;
  balance: number;
}

export interface Bank {
  id: string;
  name: string;
  accounts: Account[];
}

export interface Card {
  id: string;
  name: string;
  bankId: string;
  lastFourDigits: string;
  closingDate: number;
  dueDate: number;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export type PaymentMethod = 'debit' | 'credit' | 'cash' | 'transfer';
export type IncomeSourceType = 'bank' | 'wallet';
export type ExpenseSourceType = 'bank' | 'wallet' | 'card' | 'cash';

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  source: {
    type: IncomeSourceType;
    id: string;
  };
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  source: {
    type: ExpenseSourceType;
    id: string;
  };
  cardId?: string;
  installments?: number;
  isSaving: boolean;
}

export interface Data {
  banks: Bank[];
  cards: Card[];
  wallets: Wallet[];
  incomes: Income[];
  expenses: Expense[];
  savingsGoal: number;
}
