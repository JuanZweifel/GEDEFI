import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, LogIn } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { getSeries } from "../services/jugadoresService";
import { getFasPublico, getFasUsosPublico } from "../services/fasServices";

// 🔹 Tooltip de encabezados abreviados
type AbbrevThProps = {
  abbr: string;
  hint: string;
  className?: string;
};

const AbbrevTh: React.FC<AbbrevThProps> = ({
  abbr,
  hint,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top - r.height - 10 });
  }, [open]);

  return (
    <th className={`px-3 py-2 text-center ${className}`}>
      <div
        ref={ref}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-block cursor-help"
      >
        {abbr}
      </div>

      {open &&
        pos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
            }}
            className="
              -translate-x-1/2 -translate-y-full
              bg-black/90 text-white text-xs rounded-md px-2 py-1
              shadow-md whitespace-nowrap z-[9999]
              pointer-events-none
            "
          >
            {hint}
          </div>,
          document.body
        )}
    </th>
  );
};

// 🔹 Landing principal
export const LandingPage = () => {
  const [series, setSeries] = useState<string[]>([]);
  const [fasDisponible, setFasDisponible] = useState<number>(0);
  const [detalleFas, setDetalleFas] = useState<
    { club: string; personas: number; monto: number }[]
  >([]);
  const [isFasDialogOpen, setIsFasDialogOpen] = useState(false);
  const [montoDisponible, setMontoDisponible] = useState<number | null>(null);
  const [anioFas, setAnioFas] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFas = async () => {
      try {
        const data = await getFasPublico();
        setMontoDisponible(data.monto_disponible);
        setAnioFas(data.anio_fas);
      } catch (err: any) {
        console.error("Error al cargar FAS público:", err);
        setError(err.message);
      }
    };
    fetchFas();
  }, []);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const data = await getSeries<any[]>();
        const nombresUnicos = Array.from(
          new Set(data.map((s) => s.nombre_serie))
        );
        setSeries(nombresUnicos);
      } catch (error) {
        console.error("Error cargando series:", error);
      }
    };
    fetchSeries();
  }, []);

  useEffect(() => {
    const fetchUsosFas = async () => {
      try {
        const data = await getFasUsosPublico();
        setDetalleFas(data);
      } catch (err: any) {
        console.error("Error al cargar los usos del FAS:", err);
        setError(err.message);
      }
    };
    fetchUsosFas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0000db] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Asociación de Fútbol</h1>
                <p className="text-blue-100">Portal Oficial</p>
              </div>
            </div>
            <NavLink to="/login">
              <Button className="bg-[#FF8C00] hover:bg-[#FF7700] text-white flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-row items-start justify-between mb-12 w-full">

          <div className="flex flex-col space-y-2 flex-grow">
            <h2 className="text-4xl font-bold">Temporada 2024</h2>
            <p className="text-xl text-gray-600">
              Sigue todos los partidos, resultados y noticias de tu liga favorita
            </p>
          </div>

          <div className="flex-shrink-0 ml-8">
            <Card className="shadow-lg border border-blue-200 bg-blue-50 hover:shadow-xl transition-all">
              <CardHeader className="py-0 px-2">
                <CardTitle
                  className="text-[#0000db] text-sm text-center leading-none"
                  style={{ 
                    marginTop: 10, marginBottom: 0, paddingBottom: 0, lineHeight: "1rem" }}
                >
                  Fondo de Ayuda Solidaria (FAS)
                </CardTitle>
              </CardHeader>
              <CardContent
                className="flex flex-col items-center justify-center text-center py-0"
                style={{ marginTop: "-1rem" }} // 👈 fuerza el contenido hacia arriba
              >
                <p className="text-gray-700 text-xs">
                  Disponible:{" "}
                  <strong>
                    {montoDisponible !== null
                      ? `$${montoDisponible.toLocaleString("es-CL")}`
                      : "Consultando..."}
                  </strong>
                </p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-black text-xs px-3 py-1 mt-1 rounded-lg shadow-md"
                  onClick={() => setIsFasDialogOpen(true)}
                  disabled={montoDisponible === null}
                >
                  Ver detalles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogo FAS */}
        <Dialog open={isFasDialogOpen} onOpenChange={setIsFasDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#0000db] text-center">
                Uso del Fondo FAS
              </DialogTitle>
            </DialogHeader>
            {detalleFas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm text-gray-600">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Club</th>
                      <th className="px-3 py-2 text-center">Personas</th>
                      <th className="px-3 py-2 text-right">Monto Utilizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleFas.map((f, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{f.club}</td>
                        <td className="px-3 py-2 text-center">{f.personas}</td>
                        <td className="px-3 py-2 text-right">
                          ${f.monto.toLocaleString("es-CL")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay registros disponibles del FAS.
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* 🔹 Tabla de Posiciones */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-[#0000db] flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Tabla de Posiciones
                </CardTitle>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar serie" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.length > 0 ? (
                      series.map((serie, i) => (
                        <SelectItem key={i} value={serie}>
                          {serie}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Cargando series...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm text-gray-600">
                  <thead className="bg-gray-100">
                    <tr>
                      <AbbrevTh abbr="Pos" hint="Posición" />
                      <th className="px-3 py-2 text-left">Equipo</th>
                      <AbbrevTh abbr="Pts" hint="Puntos" />
                      <AbbrevTh abbr="PJ" hint="Partidos Jugados" />
                      <AbbrevTh abbr="PG" hint="Partidos Ganados" />
                      <AbbrevTh abbr="PE" hint="Partidos Empatados" />
                      <AbbrevTh abbr="PP" hint="Partidos Perdidos" />
                      <AbbrevTh abbr="GF" hint="Goles a Favor" />
                      <AbbrevTh abbr="GC" hint="Goles en Contra" />
                      <AbbrevTh abbr="Dif" hint="Diferencia de Goles" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={10} className="text-center text-gray-500 py-6">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Próximos Partidos */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Próximos Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-6">
                No hay partidos programados.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Resultados Recientes */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Resultados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-6">
                No hay resultados recientes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Noticias */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Noticias de la Asociación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-6">
                No hay noticias disponibles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">Asociación de Fútbol</span>
          </div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};
