
"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/use-data";
import { Upload, Download, FileText, Database, CircleOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { importData, exportData, exportCSV, resetDatabase } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        importData(file);
      } else {
        toast({
          variant: "destructive",
          title: "Error de archivo",
          description: "Por favor, selecciona un archivo JSON válido.",
        });
      }
    }
  };

  return (
    <>
      <PageHeader title="Ajustes" />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
            <CardDescription>
              Importa y exporta todos tus datos de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" /> Importar Respaldo (JSON)
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
              />
              <Button onClick={exportData} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar Respaldo (JSON)
              </Button>
              <Button onClick={exportCSV} variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Exportar Resumen (CSV)
              </Button>
            </div>
             <p className="text-sm text-muted-foreground pt-4">
                <strong>Importante:</strong> Al importar un archivo, todos los datos actuales en el navegador serán reemplazados. Asegúrate de exportar tus datos actuales primero si deseas conservarlos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuente de Datos</CardTitle>
            <CardDescription>
                Esta aplicación guarda todos los datos en una base de datos local dentro de tu navegador (usando IndexedDB).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <p className="font-medium">Modo Base de Datos Local (IndexedDB) Activo</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
                Tus datos se almacenan de forma segura y persistente en el almacenamiento interno de tu navegador, específico para este sitio web. No es un archivo que puedas acceder directamente en tu sistema de archivos. Para crear un respaldo o mover tus datos a otro dispositivo, utiliza las opciones de exportación.
            </p>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-4">
                        <CircleOff className="mr-2 h-4 w-4" /> Resetear Base de Datos
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible y eliminará permanentemente todos los datos
                        almacenados en tu navegador. Considera exportar tus datos primero.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={resetDatabase}>Sí, resetear todo</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
