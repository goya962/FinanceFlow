"use client";

import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Card as CardType } from "@/types";
import { PlusCircle, Edit, Trash2, CreditCard } from "lucide-react";

const cardSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  bankId: z.string().min(1, "El banco es requerido."),
  lastFourDigits: z.string().length(4, "Debe tener 4 dígitos."),
  closingDate: z.coerce.number().min(1).max(31),
  dueDate: z.coerce.number().min(1).max(31),
});

function CardForm({ card, onDone }: { card?: CardType; onDone: () => void }) {
  const { data, addCard, updateCard } = useData();
  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: card || { 
      name: "",
      bankId: "",
      lastFourDigits: "",
      closingDate: 1, 
      dueDate: 10 
    },
  });

  function onSubmit(values: z.infer<typeof cardSchema>) {
    if (card) {
      updateCard({ ...card, ...values });
    } else {
      addCard(values);
    }
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nombre de la Tarjeta</FormLabel><FormControl><Input placeholder="Ej: Visa Gold" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="bankId" control={form.control} render={({ field }) => (<FormItem><FormLabel>Banco Emisor</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un banco" /></SelectTrigger></FormControl><SelectContent>{data.banks.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField name="lastFourDigits" control={form.control} render={({ field }) => (<FormItem><FormLabel>Últimos 4 Dígitos</FormLabel><FormControl><Input placeholder="1234" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="closingDate" control={form.control} render={({ field }) => (<FormItem><FormLabel>Día de Cierre</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="dueDate" control={form.control} render={({ field }) => (<FormItem><FormLabel>Día de Vencimiento</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <Button type="submit">{card ? "Guardar Cambios" : "Agregar Tarjeta"}</Button>
      </form>
    </Form>
  );
}

export default function TarjetasPage() {
  const { data, deleteCard } = useData();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | undefined>();

  const getBankName = (bankId: string) => data.banks.find(b => b.id === bankId)?.name || "Banco Desconocido";

  const openDialog = (card?: CardType) => {
    setEditingCard(card);
    setFormOpen(true);
  };
  const closeDialog = () => setFormOpen(false);

  return (
    <>
      <PageHeader title="Tarjetas de Crédito">
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Tarjeta
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.cards.map((card) => (
          <Card key={card.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{card.name}</CardTitle>
                    <CardDescription>**** **** **** {card.lastFourDigits}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm font-medium">{getBankName(card.bankId)}</p>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Cierre: día {card.closingDate}</span>
                <span>Vencimiento: día {card.dueDate}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => openDialog(card)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCard(card.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardFooter>
          </Card>
        ))}
        {data.cards.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 border-dashed flex flex-col items-center justify-center py-12">
                <CardHeader>
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
                    <CardTitle className="mt-4">No hay tarjetas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Agrega tu primera tarjeta de crédito para empezar.</p>
                    <Button className="mt-4" onClick={() => openDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Agregar Tarjeta
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard ? "Editar" : "Agregar"} Tarjeta</DialogTitle>
          </DialogHeader>
          <CardForm card={editingCard} onDone={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}
