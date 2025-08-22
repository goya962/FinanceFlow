"use client";

import { useData } from "@/hooks/use-data";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PiggyBank } from "lucide-react";

const savingsFormSchema = z.object({
  goal: z.coerce.number().min(0, "Debe ser positivo").max(100, "No puede ser mayor a 100"),
});

export default function AhorrosPage() {
  const { data, updateSavingsGoal } = useData();

  const form = useForm<z.infer<typeof savingsFormSchema>>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: {
      goal: data.savingsGoal,
    },
  });

  function onSubmit(values: z.infer<typeof savingsFormSchema>) {
    updateSavingsGoal(values.goal);
  }

  return (
    <>
      <PageHeader title="Meta de Ahorro" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <Card>
            <CardHeader>
              <CardTitle>Configurar Meta</CardTitle>
              <CardDescription>
                Define qué porcentaje de tus ingresos mensuales deseas ahorrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentaje de Ahorro (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Guardar Meta</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="flex flex-col items-center justify-center text-center h-full bg-muted/30 border-dashed">
              <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                     <PiggyBank className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold">Tu meta actual es</CardTitle>
                  <CardDescription className="text-5xl font-extrabold text-accent">{data.savingsGoal}%</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Este es el porcentaje de tus ingresos que te propones ahorrar cada mes.
                </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
