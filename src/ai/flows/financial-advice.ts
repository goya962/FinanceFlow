'use server';

/**
 * @fileOverview Provides personalized financial advice based on user's income and expense data.
 *
 * - getFinancialAdvice - A function that generates financial advice.
 * - FinancialAdviceInput - The input type for the getFinancialAdvice function.
 * - FinancialAdviceOutput - The return type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAdviceInputSchema = z.object({
  startDate: z
    .string()
    .describe('The start date for analyzing financial data (YYYY-MM-DD).'),
  endDate: z
    .string()
    .describe('The end date for analyzing financial data (YYYY-MM-DD).'),
  incomeData: z.string().describe('JSON string of user income data.'),
  expenseData: z.string().describe('JSON string of user expense data.'),
});
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

const FinancialAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized financial advice in markdown format.'),
});
export type FinancialAdviceOutput = z.infer<typeof FinancialAdviceOutputSchema>;

export async function getFinancialAdvice(input: FinancialAdviceInput): Promise<FinancialAdviceOutput> {
  return financialAdviceFlow(input);
}

const financialAdvicePrompt = ai.definePrompt({
  name: 'financialAdvicePrompt',
  input: {schema: FinancialAdviceInputSchema},
  output: {schema: FinancialAdviceOutputSchema},
  prompt: `You are a financial advisor. Analyze the following income and expense data for the period between {{startDate}} and {{endDate}}, and provide personalized financial advice. Format your response in markdown.

Income Data: {{{incomeData}}}
Expense Data: {{{expenseData}}}

Give advice for how I can better manage my finances.`,
});

const financialAdviceFlow = ai.defineFlow(
  {
    name: 'financialAdviceFlow',
    inputSchema: FinancialAdviceInputSchema,
    outputSchema: FinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await financialAdvicePrompt(input);
    return output!;
  }
);
