"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/use-data";
import { Upload, Download, FileText, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { importData, exportData, exportCSV, getBlankTemplate } = useData();
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
              Importa y exporta todos tus datos de la aplicación. La aplicación funciona con un archivo local, no hay base de datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" /> Importar JSON
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
              />
              <Button onClick={exportData} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar JSON
              </Button>
              <Button onClick={exportCSV} variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Exportar Resumen CSV
              </Button>
               <Button onClick={getBlankTemplate} variant="secondary">
                <FileJson className="mr-2 h-4 w-4" /> Descargar Plantilla
              </Button>
            </div>
             <p className="text-sm text-muted-foreground pt-4">
                <strong>Importante:</strong> Al importar un archivo, todos los datos actuales serán reemplazados. Asegúrate de exportar tus datos actuales primero si deseas conservarlos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuente de Datos</CardTitle>
            <CardDescription>
                Esta aplicación está configurada para funcionar en modo "solo archivo".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
                <FileJson className="h-5 w-5 text-primary" />
                <p className="font-medium">Modo Archivo Local Activo</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
                Todas las operaciones de datos se realizan en la memoria y se guardan/cargan a través de la exportación/importación manual de archivos JSON.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
