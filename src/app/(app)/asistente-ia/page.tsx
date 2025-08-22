"use client";

import { useState } from "react";
import { useData } from "@/hooks/use-data";
import { getFinancialAdvice, FinancialAdviceOutput } from "@/ai/flows/financial-advice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
// A simple markdown renderer
import React from 'react';

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const renderContent = () => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
        }
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  return <div className="prose prose-sm dark:prose-invert max-w-none">{renderContent()}</div>;
};


export default function AsistenteIAPage() {
  const { data } = useData();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [advice, setAdvice] = useState<FinancialAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona un rango de fechas.",
      });
      return;
    }

    setIsLoading(true);
    setAdvice(null);

    const filteredIncomes = data.incomes.filter(i => {
        const d = parseISO(i.date);
        return d >= dateRange.from! && d <= dateRange.to!;
    });
    const filteredExpenses = data.expenses.filter(e => {
        const d = parseISO(e.date);
        return d >= dateRange.from! && d <= dateRange.to!;
    });

    try {
      const result = await getFinancialAdvice({
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        incomeData: JSON.stringify(filteredIncomes),
        expenseData: JSON.stringify(filteredExpenses),
      });
      setAdvice(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo obtener el consejo financiero.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Asistente Financiero IA" />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Obtener Consejo Financiero</CardTitle>
            <CardDescription>
              Selecciona un rango de fechas para que la IA analice tus finanzas y te de consejos personalizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
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
            <Button onClick={handleGetAdvice} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generar Consejo
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Analizando tus finanzas...</p>
          </div>
        )}

        {advice && (
          <Card>
            <CardHeader>
              <CardTitle>Consejo Financiero Personalizado</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Recomendaciones de la IA</AlertTitle>
                <AlertDescription className="mt-4">
                  <SimpleMarkdown content={advice.advice} />
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
