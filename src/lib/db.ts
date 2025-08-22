// lib/db.ts
import type { Bank, Card, Wallet, Income, Expense } from '@/types';
import Dexie, { type EntityTable } from 'dexie';

interface Settings {
    key: string;
    value: any;
}

const db = new Dexie('FinanceFlowDB') as Dexie & {
  banks: EntityTable<Bank, 'id'>;
  cards: EntityTable<Card, 'id'>;
  wallets: EntityTable<Wallet, 'id'>;
  incomes: EntityTable<Income, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  settings: EntityTable<Settings, 'key'>;
};

db.version(1).stores({
  banks: 'id',
  cards: 'id, bankId',
  wallets: 'id',
  incomes: 'id, date',
  expenses: 'id, date',
  settings: 'key',
});

// Seed initial data if the database is empty
db.on('populate', async () => {
    await db.settings.add({ key: 'savingsGoal', value: 10 });
    await db.banks.add({
      id: "bank-ahorros",
      name: "Ahorros",
      accounts: [
        {
          id: "account-ahorros-1",
          name: "Cuenta de Ahorro",
          cbu: "",
          alias: "",
          balance: 0,
        },
      ],
    });
});


export { db };
