"use client";

import { useState } from "react";
import { useData } from "@/hooks/use-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Bank, Account } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const bankSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
});

const accountSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  cbu: z.string().optional(),
  alias: z.string().optional(),
  balance: z.coerce.number().default(0),
});

function BankForm({ bank, onDone }: { bank?: Bank, onDone: () => void }) {
  const { addBank, updateBank } = useData();
  const form = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues: { name: bank?.name || "" },
  });

  function onSubmit(values: z.infer<typeof bankSchema>) {
    if (bank) {
      updateBank({ ...bank, ...values });
    } else {
      addBank(values);
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
              <FormLabel>Nombre del Banco</FormLabel>
              <FormControl><Input placeholder="Ej: Banco Galicia" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{bank ? "Guardar Cambios" : "Agregar Banco"}</Button>
      </form>
    </Form>
  );
}

function AccountForm({ bankId, account, onDone }: { bankId: string; account?: Account, onDone: () => void }) {
  const { addAccount, updateAccount } = useData();
  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: account || { name: "", cbu: "", alias: "", balance: 0 },
  });

  function onSubmit(values: z.infer<typeof accountSchema>) {
    const dataToSubmit = {
      ...values,
      cbu: values.cbu || '',
      alias: values.alias || '',
    };
    if (account) {
      updateAccount(bankId, { ...account, ...dataToSubmit });
    } else {
      addAccount(bankId, dataToSubmit);
    }
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre de la Cuenta</FormLabel><FormControl><Input placeholder="Ej: Caja de Ahorro" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="cbu" render={({ field }) => (<FormItem><FormLabel>CBU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="alias" render={({ field }) => (<FormItem><FormLabel>Alias</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="balance" render={({ field }) => (<FormItem><FormLabel>Saldo Inicial</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit">{account ? "Guardar Cambios" : "Agregar Cuenta"}</Button>
      </form>
    </Form>
  );
}

export default function BancosPage() {
  const { data, deleteBank, deleteAccount } = useData();
  const [isBankFormOpen, setBankFormOpen] = useState(false);
  const [isAccountFormOpen, setAccountFormOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | undefined>();
  const [editingAccount, setEditingAccount] = useState<{ bankId: string, account?: Account } | undefined>();

  const openBankDialog = (bank?: Bank) => {
    setEditingBank(bank);
    setBankFormOpen(true);
  };
  const closeBankDialog = () => setBankFormOpen(false);

  const openAccountDialog = (bankId: string, account?: Account) => {
    setEditingAccount({ bankId, account });
    setAccountFormOpen(true);
  };
  const closeAccountDialog = () => setAccountFormOpen(false);

  return (
    <>
      <PageHeader title="Bancos">
        <Button onClick={() => openBankDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Banco
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.banks.map((bank) => (
          <Card key={bank.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{bank.name}</CardTitle>
                {bank.id !== "bank-ahorros" && (
                   <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openBankDialog(bank)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBank(bank.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {bank.accounts.length > 0 ? (
                bank.accounts.map((account, index) => (
                  <div key={account.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex justify-between items-center">
                       <p className="font-semibold">{account.name}</p>
                       <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openAccountDialog(bank.id, account)}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteAccount(bank.id, account.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.cbu ? `CBU: ${account.cbu}` : ''}</p>
                    <p className="text-sm text-muted-foreground">{account.alias ? `Alias: ${account.alias}` : ''}</p>
                    <p className="font-bold text-lg mt-1">{formatCurrency(account.balance)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay cuentas agregadas.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => openAccountDialog(bank.id)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Cuenta
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isBankFormOpen} onOpenChange={setBankFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBank ? "Editar" : "Agregar"} Banco</DialogTitle>
          </DialogHeader>
          <BankForm bank={editingBank} onDone={closeBankDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAccountFormOpen} onOpenChange={setAccountFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount?.account ? "Editar" : "Agregar"} Cuenta</DialogTitle>
          </DialogHeader>
          {editingAccount && <AccountForm bankId={editingAccount.bankId} account={editingAccount.account} onDone={closeAccountDialog} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
