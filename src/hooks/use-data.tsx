
"use client";

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Data, Bank, Card, Wallet, Income, Expense, Account } from '@/types';
import { useToast } from './use-toast';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Dexie } from 'dexie';
import { addMonths, format } from 'date-fns';

const emptyData: Data = {
  banks: [],
  cards: [],
  wallets: [],
  incomes: [],
  expenses: [],
  savingsGoal: 10,
};

interface DataContextType {
  data: Data;
  isLoading: boolean;
  importData: (file: File) => void;
  exportData: () => void;
  exportCSV: () => void;
  resetDatabase: () => void;
  addBank: (bank: Omit<Bank, 'id' | 'accounts'>) => Promise<void>;
  updateBank: (bank: Bank) => Promise<void>;
  deleteBank: (bankId: string) => Promise<void>;
  addAccount: (bankId: string, account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (bankId: string, account: Account) => Promise<void>;
  deleteAccount: (bankId: string, accountId: string) => Promise<void>;
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (incomeId: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  updateSavingsGoal: (goal: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const banks = useLiveQuery(() => db.banks.toArray(), []);
  const cards = useLiveQuery(() => db.cards.toArray(), []);
  const wallets = useLiveQuery(() => db.wallets.toArray(), []);
  const incomes = useLiveQuery(() => db.incomes.toArray(), []);
  const expenses = useLiveQuery(() => db.expenses.toArray(), []);
  const savingsGoalObj = useLiveQuery(() => db.settings.get('savingsGoal'), []);
  
  const isLoading = [banks, cards, wallets, incomes, expenses, savingsGoalObj].some(v => v === undefined);

  const data = useMemo<Data>(() => {
    if (isLoading) return emptyData;
    return {
      banks: banks || [],
      cards: cards || [],
      wallets: wallets || [],
      incomes: incomes || [],
      expenses: expenses || [],
      savingsGoal: savingsGoalObj?.value as number ?? 10,
    }
  }, [isLoading, banks, cards, wallets, incomes, expenses, savingsGoalObj]);

  const handleDbOperation = async (operation: Promise<any>, successMessage: string) => {
    try {
      await operation;
      toast({ title: "Éxito", description: successMessage });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
      console.error(error);
    }
  };
  
  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedData = JSON.parse(text) as Data;
          await db.transaction('rw', db.banks, db.cards, db.wallets, db.incomes, db.expenses, db.settings, async () => {
              await Promise.all(db.tables.map(table => table.clear()));
              await db.banks.bulkAdd(importedData.banks);
              await db.cards.bulkAdd(importedData.cards);
              await db.wallets.bulkAdd(importedData.wallets);
              await db.incomes.bulkAdd(importedData.incomes);
              await db.expenses.bulkAdd(importedData.expenses);
              await db.settings.put({ key: 'savingsGoal', value: importedData.savingsGoal });
          });
          toast({ title: 'Éxito', description: 'Datos importados correctamente.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'El archivo no es un JSON válido o hubo un error en la importación.' });
        console.error(error);
      }
    };
    reader.readAsText(file);
  };
  
  const exportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "financeflow_data.json";
    link.click();
  };
  
  const exportCSV = () => {
    const headers = "type,date,description,amount,source,method\n";
    const incomesCSV = data.incomes.map(i => `income,${i.date},"${i.description}",${i.amount},${i.source.type},N/A`).join('\n');
    const expensesCSV = data.expenses.map(e => `expense,${e.date},"${e.description}",${-e.amount},${e.source.type},${e.method}`).join('\n');
    const csv = `${headers}${incomesCSV}\n${expensesCSV}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "financeflow_summary.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetDatabase = async () => {
    await handleDbOperation(
        db.transaction('rw', db.tables, () => Promise.all(db.tables.map(table => table.clear()))),
        'Base de datos reseteada.'
    );
  };
  
  // CRUD operations
  const addBank = async (bank: Omit<Bank, 'id' | 'accounts'>) => handleDbOperation(db.banks.add({ ...bank, id: crypto.randomUUID(), accounts: [] }), 'Banco agregado.');
  const updateBank = async (bank: Bank) => handleDbOperation(db.banks.put(bank), 'Banco actualizado.');
  const deleteBank = async (bankId: string) => handleDbOperation(db.banks.delete(bankId), 'Banco eliminado.');

  const addAccount = async (bankId: string, account: Omit<Account, 'id'>) => handleDbOperation(db.banks.where({id: bankId}).modify(b => { b.accounts.push({ ...account, id: crypto.randomUUID() }); }), 'Cuenta agregada.');
  const updateAccount = async (bankId: string, account: Account) => handleDbOperation(db.banks.where({id: bankId}).modify(b => { b.accounts = b.accounts.map(a => a.id === account.id ? account : a); }), 'Cuenta actualizada.');
  const deleteAccount = async (bankId: string, accountId: string) => handleDbOperation(db.banks.where({id: bankId}).modify(b => { b.accounts = b.accounts.filter(a => a.id !== accountId); }), 'Cuenta eliminada.');

  const addCard = async (card: Omit<Card, 'id'>) => handleDbOperation(db.cards.add({ ...card, id: crypto.randomUUID() }), 'Tarjeta agregada.');
  const updateCard = async (card: Card) => handleDbOperation(db.cards.put(card), 'Tarjeta actualizada.');
  const deleteCard = async (cardId: string) => handleDbOperation(db.cards.delete(cardId), 'Tarjeta eliminada.');
  
  const addWallet = async (wallet: Omit<Wallet, 'id'>) => handleDbOperation(db.wallets.add({ ...wallet, id: crypto.randomUUID() }), 'Billetera agregada.');
  const updateWallet = async (wallet: Wallet) => handleDbOperation(db.wallets.put(wallet), 'Billetera actualizada.');
  const deleteWallet = async (walletId: string) => handleDbOperation(db.wallets.delete(walletId), 'Billetera eliminada.');
  
  const addIncome = async (income: Omit<Income, 'id'>) => handleDbOperation(db.incomes.add({ ...income, id: crypto.randomUUID() }), 'Ingreso agregado.');
  const updateIncome = async (income: Income) => handleDbOperation(db.incomes.put(income), 'Ingreso actualizado.');
  const deleteIncome = async (incomeId: string) => handleDbOperation(db.incomes.delete(incomeId), 'Ingreso eliminado.');
  
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const { installments, date, description, ...rest } = expense;
    const installmentCount = expense.method === 'credit' && installments ? installments : 1;

    const op = db.transaction('rw', db.expenses, async () => {
      if (installmentCount > 1) {
        const installmentGroupId = crypto.randomUUID();
        const expenseAmount = expense.amount / installmentCount;
        for (let i = 0; i < installmentCount; i++) {
          const installmentDate = addMonths(new Date(date), i);
          const newExpense: Expense = {
            ...expense,
            id: crypto.randomUUID(),
            amount: expenseAmount,
            date: format(installmentDate, 'yyyy-MM-dd'),
            description: `${description} (${i + 1}/${installmentCount})`,
            installments: installmentCount,
            installmentGroupId,
          };
          await db.expenses.add(newExpense);
        }
      } else {
        await db.expenses.add({ ...expense, id: crypto.randomUUID() });
      }
    });

    handleDbOperation(op, 'Gasto agregado.');
  };
  
  const updateExpense = async (expense: Expense) => {
      const op = db.transaction('rw', db.expenses, async () => {
          // If the expense was part of an installment plan, delete all other installments
          if (expense.installmentGroupId) {
              const otherInstallments = await db.expenses
                  .where('installmentGroupId').equals(expense.installmentGroupId)
                  .and(item => item.id !== expense.id)
                  .toArray();
              await db.expenses.bulkDelete(otherInstallments.map(e => e.id));
          }

          // Delete the current expense being edited, to be replaced by the new logic
          await db.expenses.delete(expense.id);
          
          // Re-add the expense using the addExpense logic to handle new installment plans
          const { id, ...expenseData } = expense;
          await addExpense(expenseData);
      });

      handleDbOperation(op, 'Gasto actualizado.');
  };

  const deleteExpense = async (expenseId: string) => {
     const op = db.transaction('rw', db.expenses, async () => {
        const expense = await db.expenses.get(expenseId);
        if (expense && expense.installmentGroupId) {
            const allInstallments = await db.expenses.where('installmentGroupId').equals(expense.installmentGroupId).toArray();
            await db.expenses.bulkDelete(allInstallments.map(e => e.id));
        } else {
            await db.expenses.delete(expenseId);
        }
    });
    handleDbOperation(op, 'Gasto eliminado.');
  }

  const updateSavingsGoal = async (goal: number) => handleDbOperation(db.settings.put({ key: 'savingsGoal', value: goal }), 'Meta de ahorro actualizada.');

  const value = {
    data,
    isLoading,
    importData,
    exportData,
    exportCSV,
    resetDatabase,
    addBank,
    updateBank,
    deleteBank,
    addAccount,
    updateAccount,
    deleteAccount,
    addCard,
    updateCard,
    deleteCard,
    addWallet,
    updateWallet,
    deleteWallet,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    updateSavingsGoal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

    