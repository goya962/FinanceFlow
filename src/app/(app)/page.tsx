"use client";

import { useState, useMemo } from 'react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { getMonth, getYear, parseISO, isSameMonth, isSameYear, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  ingresos: {
    label: 'Ingresos',
    color: 'hsl(var(--chart-1))',
  },
  gastos: {
    label: 'Gastos',
    color: 'hsl(var(--chart-2))',
  },
  ahorros: {
    label: 'Ahorros',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;


export default function Dashboard() {
  const { data } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
  const years = useMemo(() => {
    const allDates = [...data.incomes.map(i => i.date), ...data.expenses.map(e => e.date)];
    if (allDates.length === 0) return [getYear(new Date())];
    const uniqueYears = [...new Set(allDates.map(d => getYear(parseISO(d))))];
    return uniqueYears.sort((a, b) => b - a);
  }, [data.incomes, data.expenses]);

  const monthlyData = useMemo(() => {
    const incomes = data.incomes.filter(i => isSameMonth(parseISO(i.date), selectedDate) && isSameYear(parseISO(i.date), selectedDate));
    const expenses = data.expenses.filter(e => isSameMonth(parseISO(e.date), selectedDate) && isSameYear(parseISO(e.date), selectedDate));

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const prevMonthDate = subMonths(selectedDate, 1);
    const prevMonthIncomes = data.incomes
        .filter(i => isSameMonth(parseISO(i.date), prevMonthDate) && isSameYear(parseISO(i.date), prevMonthDate))
        .reduce((sum, i) => sum + i.amount, 0);
    const prevMonthExpenses = data.expenses
        .filter(e => isSameMonth(parseISO(e.date), prevMonthDate) && isSameYear(parseISO(e.date), prevMonthDate))
        .reduce((sum, e) => sum + e.amount, 0);
    const carryOver = prevMonthIncomes - prevMonthExpenses;

    const balance = totalIncome - totalExpenses + carryOver;
    
    return { incomes, expenses, totalIncome, totalExpenses, balance, carryOver };
  }, [data.incomes, data.expenses, selectedDate]);

  const totalSavings = useMemo(() => {
    return data.expenses
      .filter(e => e.isSaving)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [data.expenses]);

  const yearlyChartData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const monthDate = new Date(getYear(selectedDate), i);
      const monthlyIncomes = data.incomes
        .filter(inc => isSameMonth(parseISO(inc.date), monthDate) && isSameYear(parseISO(inc.date), monthDate))
        .reduce((sum, inc) => sum + inc.amount, 0);
      const monthlyExpenses = data.expenses
        .filter(exp => isSameMonth(parseISO(exp.date), monthDate) && isSameYear(parseISO(exp.date), monthDate) && !exp.isSaving)
        .reduce((sum, exp) => sum + exp.amount, 0);
      const monthlySavings = data.expenses
        .filter(exp => exp.isSaving && isSameMonth(parseISO(exp.date), monthDate) && isSameYear(parseISO(exp.date), monthDate))
        .reduce((sum, exp) => sum + exp.amount, 0);
      return {
        name: months[i].substring(0, 3),
        ingresos: monthlyIncomes,
        gastos: monthlyExpenses,
        ahorros: monthlySavings,
      };
    });
  }, [data.incomes, data.expenses, selectedDate, months]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Select value={String(getMonth(selectedDate))} onValueChange={(val) => setSelectedDate(new Date(getYear(selectedDate), parseInt(val)))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, i) => <SelectItem key={month} value={String(i)}>{month}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(getYear(selectedDate))} onValueChange={(val) => setSelectedDate(new Date(parseInt(val), getMonth(selectedDate)))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader><CardTitle>Ingresos del Mes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-[hsl(var(--chart-1))]">{formatCurrency(monthlyData.totalIncome)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Gastos del Mes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-[hsl(var(--chart-2))]">{formatCurrency(monthlyData.totalExpenses)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Arrastre Mes Anterior</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(monthlyData.carryOver)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Balance Mensual</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(monthlyData.balance)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ahorros Totales</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-[hsl(var(--chart-3))]">{formatCurrency(totalSavings)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Resumen Anual ({getYear(selectedDate)})</CardTitle></CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={yearlyChartData} margin={{ top: 20 }}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip
                content={<ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                  />}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="var(--color-ingresos)" name="Ingresos" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="ingresos" position="top" formatter={(value: number) => value > 0 ? formatCurrency(value) : ''} />
              </Bar>
              <Bar dataKey="gastos" fill="var(--color-gastos)" name="Gastos" radius={[4, 4, 0, 0]}>
                 <LabelList dataKey="gastos" position="top" formatter={(value: number) => value > 0 ? formatCurrency(value) : ''} />
              </Bar>
              <Bar dataKey="ahorros" fill="var(--color-ahorros)" name="Ahorros" radius={[4, 4, 0, 0]}>
                 <LabelList dataKey="ahorros" position="top" formatter={(value: number) => value > 0 ? formatCurrency(value) : ''} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ingresos Recientes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.incomes.slice(0, 5).map(income => (
                  <TableRow key={income.id}>
                    <TableCell>{income.description}</TableCell>
                    <TableCell className="text-right text-[hsl(var(--chart-1))]">{formatCurrency(income.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Gastos Recientes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.expenses.slice(0, 5).map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className={cn("text-right", expense.isSaving ? 'text-[hsl(var(--chart-3))]' : 'text-[hsl(var(--chart-2))]')}>{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
