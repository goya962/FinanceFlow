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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Income, IncomeSourceType } from "@/types";
import { PlusCircle, Edit, Trash2, CalendarIcon } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DateRange } from "react-day-picker";

const incomeSchema = z.object({
  description: z.string().min(2, "La descripción es requerida."),
  amount: z.coerce.number().positive("El monto debe ser positivo."),
  date: z.date({ required_error: "La fecha es requerida." }),
  sourceId: z.string().min(1, "La fuente es requerida."),
});

function IncomeForm({ income, onDone }: { income?: Income, onDone: () => void }) {
  const { data, addIncome, updateIncome } = useData();
  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income ? {
      ...income,
      date: parseISO(income.date),
      sourceId: income.source.id,
    } : {
      description: "",
      amount: 0,
      date: new Date(),
      sourceId: "",
    },
  });

  const availableSources = useMemo(() => {
    return [
        ...data.banks.flatMap(b => b.accounts.map(a => ({...a, id: a.id, name: `${b.name} - ${a.name}`}))), 
        ...data.wallets
    ];
  }, [data]);
  
  const getSourceType = (sourceId: string): { type: IncomeSourceType, id: string } => {
    if (data.wallets.some(w => w.id === sourceId)) {
        return { type: 'wallet', id: sourceId };
    }
     // Find the account across all banks
    for (const bank of data.banks) {
      if (bank.accounts.some(a => a.id === sourceId)) {
        return { type: 'bank', id: sourceId };
      }
    }
    // Fallback, though should not be reached if logic is correct
    return { type: 'bank', id: sourceId };
  }

  function onSubmit(values: z.infer<typeof incomeSchema>) {
    const incomeData = {
      description: values.description,
      amount: values.amount,
      date: format(values.date, 'yyyy-MM-dd'),
      source: getSourceType(values.sourceId),
    };
    if (income) {
      updateIncome({ ...income, ...incomeData });
    } else {
      addIncome(incomeData);
    }
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="description" control={form.control} render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="amount" control={form.control} render={({ field }) => (<FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="date" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? formatDate(field.value) : <span>Elige una fecha</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField name="sourceId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Fuente</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una fuente" /></SelectTrigger></FormControl><SelectContent>{availableSources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <Button type="submit">{income ? "Guardar Cambios" : "Agregar Ingreso"}</Button>
      </form>
    </Form>
  );
}

export default function IngresosPage() {
  const { data, deleteIncome, isLoading } = useData();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const filteredIncomes = useMemo(() => {
    if (isLoading || !data.incomes || !dateRange?.from) return [];
    
    const fromDate = dateRange.from;
    const toDate = dateRange.to || dateRange.from; // If only from is selected, use it as to date

    return data.incomes
      .filter(i => {
        const incomeDate = parseISO(i.date);
        return incomeDate >= fromDate && incomeDate <= toDate;
      })
      .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [data.incomes, dateRange, isLoading]);
  
  const openDialog = (income?: Income) => {
    setEditingIncome(income);
    setFormOpen(true);
  };
  const closeDialog = () => setFormOpen(false);

  const getSourceName = (source: {type: string, id: string}) => {
    if (source.type === 'wallet') return data.wallets.find(w => w.id === source.id)?.name || 'Billetera';
    if (source.type === 'bank') {
        for (const bank of data.banks) {
            const account = bank.accounts.find(a => a.id === source.id);
            if (account) return `${bank.name} - ${account.name}`;
        }
    }
    return 'Desconocido'
  }

  return (
    <>
      <PageHeader title="Ingresos">
        <div className="flex gap-2">
           <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          <Button onClick={() => openDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Ingreso</Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5" /></TableCell>
                        <TableCell><Skeleton className="h-5" /></TableCell>
                        <TableCell><Skeleton className="h-5" /></TableCell>
                        <TableCell><Skeleton className="h-5" /></TableCell>
                        <TableCell><Skeleton className="h-5" /></TableCell>
                    </TableRow>
                ))
              ) : filteredIncomes.length > 0 ? filteredIncomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.description}</TableCell>
                  <TableCell>{formatDate(income.date)}</TableCell>
                  <TableCell>{getSourceName(income.source)}</TableCell>
                  <TableCell className="text-right text-primary">{formatCurrency(income.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(income)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteIncome(income.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center">No hay ingresos para este período.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingIncome ? "Editar" : "Agregar"} Ingreso</DialogTitle></DialogHeader>
          <IncomeForm income={editingIncome} onDone={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}
