import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { DialogHandle } from "../components/dialog-component";
import { Input } from "../components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  token: string | null;
};

export const ReportePartidosDialog: React.FC<Props> = ({ token }) => {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8000/reportes/partidos?month=${month}&year=${year}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });
      if (!response.ok) throw new Error("Error al generar el reporte");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `partidos_${month}_${year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <DialogHandle
      title="Generar Reporte de Partidos"
      trigger={
        <Button
          style={{ backgroundColor: '#0000db' }}
          className="text-white flex items-center"
        >

          <Plus className="w-4 h-4 mr-2" />
          Generar Reporte
        </Button>
      }
    >
      {() => (
        <div className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Mes</label>
              <Input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-32 text-center"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Año</label>
              <Input
                type="number"
                min={2000}
                max={2026}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-32 text-center"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleDownload}
            >
              Descargar PDF
            </Button>
          </div>
        </div>
      )}
    </DialogHandle>
  );
};
