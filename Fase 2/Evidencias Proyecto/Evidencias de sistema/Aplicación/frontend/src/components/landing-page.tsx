import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Trophy, Users, MapPin, Clock, LogIn } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
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
            <Button
              className="bg-[#FF8C00] hover:bg-[#FF7700] text-white flex items-center"
              onClick={onLogin}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Temporada 2024</h2>
          <p className="text-xl text-gray-600">Sigue todos los partidos, resultados y noticias de tu liga favorita</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Standings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0000db] flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Tabla de Posiciones - Serie A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { pos: 1, team: "FC Barcelona Santiago", pts: 45, pj: 16, pg: 14, pe: 3, pp: -1, gf: 42, gc: 12 },
                    { pos: 2, team: "Real Madrid Chile", pts: 38, pj: 16, pg: 12, pe: 2, pp: 2, gf: 35, gc: 15 },
                    { pos: 3, team: "Universidad de Chile", pts: 35, pj: 16, pg: 10, pe: 5, pp: 1, gf: 28, gc: 18 },
                    { pos: 4, team: "Colo-Colo", pts: 32, pj: 16, pg: 9, pe: 5, pp: 2, gf: 30, gc: 20 },
                    { pos: 5, team: "Universidad Católica", pts: 28, pj: 16, pg: 8, pe: 4, pp: 4, gf: 25, gc: 22 }
                  ].map((team, i) => (
                    <div key={i} className={`grid grid-cols-8 gap-2 p-3 rounded-lg text-sm ${i < 3 ? 'bg-green-50 border border-green-200' :
                      i === 4 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                      }`}>
                      <div className="font-bold text-center">{team.pos}</div>
                      <div className="col-span-3 font-medium">{team.team}</div>
                      <div className="text-center">{team.pts}</div>
                      <div className="text-center">{team.pj}</div>
                      <div className="text-center text-green-600">{team.gf}</div>
                      <div className="text-center text-red-600">{team.gc}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-8 gap-2 p-2 border-t mt-4 text-xs font-medium text-gray-600">
                  <div className="text-center">Pos</div>
                  <div className="col-span-3">Equipo</div>
                  <div className="text-center">Pts</div>
                  <div className="text-center">PJ</div>
                  <div className="text-center">GF</div>
                  <div className="text-center">GC</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Matches */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0000db] flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Próximos Partidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "15 Sep",
                      time: "15:00",
                      local: "FC Barcelona",
                      visitante: "Real Madrid",
                      stadium: "Estadio Nacional"
                    },
                    {
                      date: "16 Sep",
                      time: "17:00",
                      local: "Universidad Chile",
                      visitante: "Colo-Colo",
                      stadium: "Santa Laura"
                    },
                    {
                      date: "17 Sep",
                      time: "19:00",
                      local: "Católica",
                      visitante: "La Serena",
                      stadium: "San Carlos"
                    }
                  ].map((match, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[#0000db]">{match.date}</Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {match.time}
                        </div>
                      </div>
                      <div className="text-center mb-1">
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
        </div>

        {/* Recent Results */}
        <div className="mt-8">
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

        {/* News Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0000db]">Noticias de la Asociación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Nuevo reglamento para la próxima temporada",
                    description: "Se han implementado nuevas reglas que entrarán en vigor a partir del próximo campeonato.",
                    date: "10 Sep 2024",
                    category: "Reglamento"
                  },
                  {
                    title: "Inauguración de nuevas instalaciones deportivas",
                    description: "Se inauguraron dos nuevas canchas que estarán disponibles para todos los clubes afiliados.",
                    date: "08 Sep 2024",
                    category: "Infraestructura"
                  },
                  {
                    title: "Fechas importantes del calendario 2024",
                    description: "Conoce todas las fechas importantes del resto de la temporada incluyendo playoffs y finales.",
                    date: "05 Sep 2024",
                    category: "Calendario"
                  }
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
