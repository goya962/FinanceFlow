"use client";

import { useState } from "react";
import { useData } from "@/hooks/use-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Wallet } from "@/types";
import { PlusCircle, Edit, Trash2, Wallet as WalletIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const walletSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  balance: z.coerce.number().default(0),
});

function WalletForm({ wallet, onDone }: { wallet?: Wallet, onDone: () => void }) {
  const { addWallet, updateWallet } = useData();
  const form = useForm<z.infer<typeof walletSchema>>({
    resolver: zodResolver(walletSchema),
    defaultValues: wallet || { name: "", balance: 0 },
  });

  function onSubmit(values: z.infer<typeof walletSchema>) {
    if (wallet) {
      updateWallet({ ...wallet, ...values });
    } else {
      addWallet(values);
    }
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Billetera</FormLabel>
              <FormControl><Input placeholder="Ej: Mercado Pago" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo Inicial</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{wallet ? "Guardar Cambios" : "Agregar Billetera"}</Button>
      </form>
    </Form>
  );
}

export default function BilleterasPage() {
  const { data, deleteWallet } = useData();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | undefined>();

  const openDialog = (wallet?: Wallet) => {
    setEditingWallet(wallet);
    setFormOpen(true);
  };
  const closeDialog = () => setFormOpen(false);

  return (
    <>
      <PageHeader title="Billeteras Digitales">
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Billetera
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.wallets.map((wallet) => (
          <Card key={wallet.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <WalletIcon className="h-8 w-8 text-primary" />
                  <CardTitle>{wallet.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">Saldo Actual</p>
              <p className="text-3xl font-bold">{formatCurrency(wallet.balance)}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => openDialog(wallet)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteWallet(wallet.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardFooter>
          </Card>
        ))}
         {data.wallets.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 border-dashed flex flex-col items-center justify-center py-12">
                <CardHeader>
                    <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <CardTitle className="mt-4">No hay billeteras</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Agrega tu primera billetera digital para empezar.</p>
                    <Button className="mt-4" onClick={() => openDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Agregar Billetera
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWallet ? "Editar" : "Agregar"} Billetera</DialogTitle>
          </DialogHeader>
          <WalletForm wallet={editingWallet} onDone={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}
