# **App Name**: FinanceFile

## Core Features:

- Financial Overview: Dashboard presenting a summary of financial data, including monthly income, expenses, balance, and total savings.
- Import Data: Allows users to upload a JSON file to import their financial data into the application, initializing the app state.
- Export Data: Allows users to export their current financial data (banks, cards, wallets, incomes, expenses, savings goal) into a JSON file.
- CRUD Operations: Allows users to create, read, update and delete entries for incomes, expenses, bank accounts, cards, and digital wallets, managing all the financial data stored in the file.
- AI Financial Assistant: Provides personalized financial advice based on income and expense data for a user-defined date range. The LLM is a tool that might incorporate specific financial data based on its assessment.
- State Management: Manages the entire application state in a single JSON object and handles all create, read, update and delete operations by performing these operation on the file state. This object contains: banks, cards, wallets, incomes, expenses, savingsGoal.

## Style Guidelines:

- Primary color: Navy blue (#2E4765) to convey trust and stability.
- Background color: Light gray (#F0F4F8), offering a clean and neutral backdrop.
- Accent color: Teal (#45B39D) for interactive elements, providing a pop of color that suggests growth and financial health.
- Body and headline font: 'Inter' (sans-serif) for a modern, clean and neutral feel.