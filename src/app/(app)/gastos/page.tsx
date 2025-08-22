"use client";

import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Expense, PaymentMethod } from "@/types";
import { PlusCircle, Edit, Trash2, CalendarIcon } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { format, getMonth, getYear, parseISO, isSameMonth, isSameYear } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

const expenseSchema = z.object({
  description: z.string().min(2, "La descripción es requerida."),
  amount: z.coerce.number().positive("El monto debe ser positivo."),
  date: z.date({ required_error: "La fecha es requerida." }),
  method: z.enum(['debit', 'credit', 'cash', 'transfer']),
  sourceId: z.string().min(1, "La fuente es requerida."),
  cardId: z.string().optional(),
  installments: z.coerce.number().optional(),
  isSaving: z.boolean().default(false),
});

function ExpenseForm({ expense, onDone }: { expense?: Expense; onDone: () => void }) {
  const { data, addExpense, updateExpense } = useData();
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      ...expense,
      date: parseISO(expense.date),
      sourceId: expense.source.id,
      cardId: expense.cardId || "",
      installments: expense.installments || 1,
    } : {
      description: "",
      amount: 0,
      date: new Date(),
      method: "debit",
      sourceId: "",
      isSaving: false,
      installments: 1,
      cardId: "",
    },
  });

  const paymentMethod = form.watch("method");

  const availableSources = useMemo(() => {
    if (paymentMethod === 'credit') return data.cards;
    if (paymentMethod === 'cash') return [{id: 'cash', name: 'Efectivo'}];
    return [...data.banks.flatMap(b => b.accounts.map(a => ({...a, name: `${b.name} - ${a.name}`}))), ...data.wallets];
  }, [paymentMethod, data]);
  
  const getSourceType = (method: PaymentMethod, sourceId: string): { type: 'bank' | 'wallet' | 'card' | 'cash', id: string } => {
    if (method === 'credit') return { type: 'card', id: sourceId };
    if (method === 'cash') return { type: 'cash', id: sourceId };
    if (data.wallets.some(w => w.id === sourceId)) return { type: 'wallet', id: sourceId };
    return { type: 'bank', id: sourceId };
  }

  function onSubmit(values: z.infer<typeof expenseSchema>) {
    const expenseData = {
      description: values.description,
      amount: values.amount,
      date: format(values.date, 'yyyy-MM-dd'),
      method: values.method as PaymentMethod,
      source: getSourceType(values.method as PaymentMethod, values.sourceId),
      cardId: values.cardId,
      installments: values.installments,
      isSaving: values.isSaving,
    }
    if (expense) {
      updateExpense({ ...expense, ...expenseData });
    } else {
      addExpense(expenseData);
    }
    onDone();
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="description" control={form.control} render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="amount" control={form.control} render={({ field }) => (<FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="date" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? formatDate(field.value) : <span>Elige una fecha</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField name="method" control={form.control} render={({ field }) => (<FormItem><FormLabel>Método de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un método" /></SelectTrigger></FormControl><SelectContent><SelectItem value="debit">Débito</SelectItem><SelectItem value="credit">Crédito</SelectItem><SelectItem value="cash">Efectivo</SelectItem><SelectItem value="transfer">Transferencia</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        
        {paymentMethod && (
           <FormField name="sourceId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Fuente</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una fuente" /></SelectTrigger></FormControl><SelectContent>{availableSources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        )}
        
        {paymentMethod === 'credit' && (
          <FormField name="installments" control={form.control} render={({ field }) => (<FormItem><FormLabel>Cuotas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        )}
        
        <FormField name="isSaving" control={form.control} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Marcar como ahorro</FormLabel></div></FormItem>)} />
        <Button type="submit">{expense ? "Guardar Cambios" : "Agregar Gasto"}</Button>
      </form>
    </Form>
  );
}


export default function GastosPage() {
  const { data, deleteExpense } = useData();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('es-ES', { month: 'long' }));
  const years = useMemo(() => {
    if (data.expenses.length === 0) return [getYear(new Date())];
    return [...new Set(data.expenses.map(e => getYear(parseISO(e.date))))].sort((a, b) => b - a);
  }, [data.expenses]);

  const filteredExpenses = useMemo(() => {
    return data.expenses
      .filter(e => isSameMonth(parseISO(e.date), selectedDate) && isSameYear(parseISO(e.date), selectedDate))
      .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [data.expenses, selectedDate]);
  
  const openDialog = (expense?: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };
  const closeDialog = () => setFormOpen(false);

  return (
    <>
      <PageHeader title="Gastos">
        <div className="flex gap-2">
            <Select value={String(getMonth(selectedDate))} onValueChange={(val) => setSelectedDate(new Date(getYear(selectedDate), parseInt(val)))}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mes" /></SelectTrigger>
              <SelectContent>{months.map((month, i) => <SelectItem key={month} value={String(i)}>{month}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(getYear(selectedDate))} onValueChange={(val) => setSelectedDate(new Date(parseInt(val), getMonth(selectedDate)))}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Año" /></SelectTrigger>
              <SelectContent>{years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
            </Select>
          <Button onClick={() => openDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Gasto</Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell className="capitalize">{expense.method}</TableCell>
                  <TableCell className={cn("text-right", expense.isSaving ? 'text-[hsl(var(--chart-3))]' : 'text-[hsl(var(--chart-2))]')}>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(expense)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteExpense(expense.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center">No hay gastos para este mes.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingExpense ? "Editar" : "Agregar"} Gasto</DialogTitle></DialogHeader>
          <ExpenseForm expense={editingExpense} onDone={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}
