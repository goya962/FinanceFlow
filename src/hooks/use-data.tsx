"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Data, Bank, Card, Wallet, Income, Expense, Account } from '@/types';
import { generateNumericId } from '@/lib/utils';
import { useToast } from './use-toast';

const emptyData: Data = {
  banks: [
    {
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
    },
  ],
  cards: [],
  wallets: [],
  incomes: [],
  expenses: [],
  savingsGoal: 10,
};

interface DataContextType {
  data: Data;
  setData: (data: Data) => void;
  isLoading: boolean;
  importData: (file: File) => void;
  exportData: () => void;
  exportCSV: () => void;
  getBlankTemplate: () => void;
  addBank: (bank: Omit<Bank, 'id' | 'accounts'>) => void;
  updateBank: (bank: Bank) => void;
  deleteBank: (bankId: string) => void;
  addAccount: (bankId: string, account: Omit<Account, 'id'>) => void;
  updateAccount: (bankId: string, account: Account) => void;
  deleteAccount: (bankId: string, accountId: string) => void;
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCard: (card: Card) => void;
  deleteCard: (cardId: string) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (walletId: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (incomeId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  updateSavingsGoal: (goal: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Data>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleStateUpdate = (updater: (prevData: Data) => Data, successMessage: string) => {
    try {
      setData(updater);
      toast({ title: "Éxito", description: successMessage });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    }
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedData = JSON.parse(text);
          // Basic validation could be added here
          setData(importedData);
          toast({ title: 'Éxito', description: 'Datos importados correctamente.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'El archivo no es un JSON válido.' });
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
  
  const getBlankTemplate = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(emptyData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "financeflow_template.json";
    link.click();
  }

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
  }

  // CRUD operations
  const addBank = (bank: Omit<Bank, 'id' | 'accounts'>) => handleStateUpdate(prev => ({ ...prev, banks: [...prev.banks, { ...bank, id: generateNumericId(prev.banks, 'bank'), accounts: [] }] }), 'Banco agregado.');
  const updateBank = (bank: Bank) => handleStateUpdate(prev => ({ ...prev, banks: prev.banks.map(b => b.id === bank.id ? bank : b) }), 'Banco actualizado.');
  const deleteBank = (bankId: string) => handleStateUpdate(prev => ({ ...prev, banks: prev.banks.filter(b => b.id !== bankId) }), 'Banco eliminado.');

  const addAccount = (bankId: string, account: Omit<Account, 'id'>) => handleStateUpdate(prev => ({ ...prev, banks: prev.banks.map(b => b.id === bankId ? { ...b, accounts: [...b.accounts, { ...account, id: generateNumericId(b.accounts, `account-${bankId}`) }] } : b) }), 'Cuenta agregada.');
  const updateAccount = (bankId: string, account: Account) => handleStateUpdate(prev => ({ ...prev, banks: prev.banks.map(b => b.id === bankId ? { ...b, accounts: b.accounts.map(a => a.id === account.id ? account : a) } : b) }), 'Cuenta actualizada.');
  const deleteAccount = (bankId: string, accountId: string) => handleStateUpdate(prev => ({ ...prev, banks: prev.banks.map(b => b.id === bankId ? { ...b, accounts: b.accounts.filter(a => a.id !== accountId) } : b) }), 'Cuenta eliminada.');

  const addCard = (card: Omit<Card, 'id'>) => handleStateUpdate(prev => ({ ...prev, cards: [...prev.cards, { ...card, id: generateNumericId(prev.cards, 'card') }] }), 'Tarjeta agregada.');
  const updateCard = (card: Card) => handleStateUpdate(prev => ({ ...prev, cards: prev.cards.map(c => c.id === card.id ? card : c) }), 'Tarjeta actualizada.');
  const deleteCard = (cardId: string) => handleStateUpdate(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== cardId) }), 'Tarjeta eliminada.');

  const addWallet = (wallet: Omit<Wallet, 'id'>) => handleStateUpdate(prev => ({ ...prev, wallets: [...prev.wallets, { ...wallet, id: generateNumericId(prev.wallets, 'wallet') }] }), 'Billetera agregada.');
  const updateWallet = (wallet: Wallet) => handleStateUpdate(prev => ({ ...prev, wallets: prev.wallets.map(w => w.id === wallet.id ? wallet : w) }), 'Billetera actualizada.');
  const deleteWallet = (walletId: string) => handleStateUpdate(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== walletId) }), 'Billetera eliminada.');

  const addIncome = (income: Omit<Income, 'id'>) => handleStateUpdate(prev => ({ ...prev, incomes: [...prev.incomes, { ...income, id: generateNumericId(prev.incomes, 'income') }] }), 'Ingreso agregado.');
  const updateIncome = (income: Income) => handleStateUpdate(prev => ({ ...prev, incomes: prev.incomes.map(i => i.id === income.id ? income : i) }), 'Ingreso actualizado.');
  const deleteIncome = (incomeId: string) => handleStateUpdate(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== incomeId) }), 'Ingreso eliminado.');

  const addExpense = (expense: Omit<Expense, 'id'>) => handleStateUpdate(prev => ({ ...prev, expenses: [...prev.expenses, { ...expense, id: generateNumericId(prev.expenses, 'expense') }] }), 'Gasto agregado.');
  const updateExpense = (expense: Expense) => handleStateUpdate(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === expense.id ? expense : e) }), 'Gasto actualizado.');
  const deleteExpense = (expenseId: string) => handleStateUpdate(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== expenseId) }), 'Gasto eliminado.');

  const updateSavingsGoal = (goal: number) => handleStateUpdate(prev => ({ ...prev, savingsGoal: goal }), 'Meta de ahorro actualizada.');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const value = {
    data,
    setData,
    isLoading,
    importData,
    exportData,
    exportCSV,
    getBlankTemplate,
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
