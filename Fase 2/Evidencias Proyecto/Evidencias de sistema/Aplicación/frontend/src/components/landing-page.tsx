import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Trophy, Users, MapPin, Clock, LogIn } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { getSeries } from "../services/jugadoresService";

export const LandingPage = () => {
  const [series, setSeries] = useState<any[]>([]);

  // Cargar las series desde la BD al montar el componente
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const data = await getSeries<any[]>(); // 👈 Llama al servicio
        // Extraer solo los nombres únicos de las series
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Temporada 2024</h2>
          <p className="text-xl text-gray-600">
            Sigue todos los partidos, resultados y noticias de tu liga favorita
          </p>
        </div>

        <div className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                {/* Título a la izquierda */}
                <CardTitle className="text-[#0000db] flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Tabla de Posiciones
                </CardTitle>

                {/* Select dinámico de series */}
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
                      <th className="px-3 py-2 text-center">Pos</th>
                      <th className="px-3 py-2 text-left">Equipo</th>
                      <th className="px-3 py-2 text-center">Pts</th>
                      <th className="px-3 py-2 text-center">PJ</th>
                      <th className="px-3 py-2 text-center">PG</th>
                      <th className="px-3 py-2 text-center">PE</th>
                      <th className="px-3 py-2 text-center">PP</th>
                      <th className="px-3 py-2 text-center">GF</th>
                      <th className="px-3 py-2 text-center">GC</th>
                      <th className="px-3 py-2 text-center">Dif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Aquí se llenarán los equipos dinámicamente */}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Partidos */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Próximos Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { date: "15 Sep", time: "15:00", local: "FC Barcelona", visitante: "Real Madrid", stadium: "Estadio Nacional" },
                  { date: "16 Sep", time: "17:00", local: "Universidad Chile", visitante: "Colo-Colo", stadium: "Santa Laura" },
                  { date: "17 Sep", time: "19:00", local: "Católica", visitante: "La Serena", stadium: "San Carlos" }
                ].map((match, i) => (
                  <div key={i} className="border rounded-lg p-4 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[#0000db]">{match.date}</Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.time}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div className="font-medium">{match.local}</div>
                      <div className="text-xs text-gray-500">vs</div>
                      <div className="font-medium">{match.visitante}</div>
                    </div>
                    <div className="flex items-center justify-center text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {match.stadium}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados Recientes */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Resultados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { local: "FC Barcelona", golesLocal: 3, golesVisitante: 1, visitante: "Universidad Chile", fecha: "08 Sep" },
                  { local: "Real Madrid", golesLocal: 2, golesVisitante: 0, visitante: "Colo-Colo", fecha: "07 Sep" },
                  { local: "Católica", golesLocal: 1, golesVisitante: 1, visitante: "La Serena", fecha: "06 Sep" }
                ].map((result, i) => (
                  <div key={i} className="border rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-2">{result.fecha}</div>
                    <div className="font-medium text-sm">{result.local}</div>
                    <div className="text-2xl font-bold text-[#0000db] my-2">
                      {result.golesLocal} - {result.golesVisitante}
                    </div>
                    <div className="font-medium text-sm">{result.visitante}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Noticias */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Noticias de la Asociación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Nuevo reglamento para la próxima temporada", description: "Se han implementado nuevas reglas que entrarán en vigor a partir del próximo campeonato.", date: "10 Sep 2024", category: "Reglamento" },
                  { title: "Inauguración de nuevas instalaciones deportivas", description: "Se inauguraron dos nuevas canchas que estarán disponibles para todos los clubes afiliados.", date: "08 Sep 2024", category: "Infraestructura" },
                  { title: "Fechas importantes del calendario 2024", description: "Conoce todas las fechas importantes del resto de la temporada incluyendo playoffs y finales.", date: "05 Sep 2024", category: "Calendario" }
                ].map((news, i) => (
                  <div key={i} className="border-l-4 border-[#0000db] pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">{news.category}</Badge>
                      <span className="text-xs text-gray-500">{news.date}</span>
                    </div>
                    <h3 className="font-medium mb-1">{news.title}</h3>
                    <p className="text-sm text-gray-600">{news.description}</p>
                  </div>
                ))}
              </div>
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
          <p className="text-gray-400">© 2024 Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};