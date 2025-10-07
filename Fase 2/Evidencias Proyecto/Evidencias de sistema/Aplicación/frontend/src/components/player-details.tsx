import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Target, Users, AlertTriangle } from 'lucide-react';

interface PlayerDetailsProps {
  onBack: () => void;
}

export const PlayerDetails: React.FC<PlayerDetailsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const playerData = {
    rut: "12.345.678-9",
    name: "Carlos Rodríguez",
    club: "FC Barcelona Santiago",
    position: "Delantero",
    age: 24,
    totalGoals: 15,
    totalAssists: 8,
    yellowCards: 3,
    redCards: 1
  };

  const goalDetails = [
    { match: "vs Real Madrid", date: "2024-08-15", minute: "23'", type: "Penal", opponent: "Real Madrid Chile" },
    { match: "vs Universidad", date: "2024-08-08", minute: "67'", type: "Cabezazo", opponent: "Universidad de Chile" },
    { match: "vs Colo-Colo", date: "2024-07-30", minute: "45'", type: "Tiro libre", opponent: "Colo-Colo" },
    { match: "vs Católica", date: "2024-07-22", minute: "12'", type: "Jugada personal", opponent: "Universidad Católica" },
    { match: "vs La Serena", date: "2024-07-15", minute: "89'", type: "Centro", opponent: "La Serena" }
  ];

  const assistDetails = [
    { match: "vs Real Madrid", date: "2024-08-15", minute: "78'", receiver: "Juan Pérez", opponent: "Real Madrid Chile" },
    { match: "vs Universidad", date: "2024-08-08", minute: "34'", receiver: "Miguel Silva", opponent: "Universidad de Chile" },
    { match: "vs Colo-Colo", date: "2024-07-30", minute: "56'", receiver: "Pedro López", opponent: "Colo-Colo" },
    { match: "vs Católica", date: "2024-07-22", minute: "67'", receiver: "Ana González", opponent: "Universidad Católica" }
  ];

  const cardDetails = [
    { match: "vs Real Madrid", date: "2024-08-15", minute: "45'", type: "Amarilla", reason: "Falta táctica", opponent: "Real Madrid Chile" },
    { match: "vs Universidad", date: "2024-08-08", minute: "67'", type: "Amarilla", reason: "Protesta", opponent: "Universidad de Chile" },
    { match: "vs Colo-Colo", date: "2024-07-30", minute: "23'", type: "Roja", reason: "Doble amarilla", opponent: "Colo-Colo" },
    { match: "vs Católica", date: "2024-07-22", minute: "89'", type: "Amarilla", reason: "Falta fuerte", opponent: "Universidad Católica" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h2>Detalles del Jugador: {playerData.name}</h2>
      </div>

      {/* Player Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0000db]">{playerData.totalGoals}</div>
              <p className="text-sm text-gray-600">Goles</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF8C00]">{playerData.totalAssists}</div>
              <p className="text-sm text-gray-600">Asistencias</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{playerData.yellowCards}</div>
              <p className="text-sm text-gray-600">Tarjetas Amarillas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{playerData.redCards}</div>
              <p className="text-sm text-gray-600">Tarjetas Rojas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goals" className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Goles Detallados
              </TabsTrigger>
              <TabsTrigger value="assists" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Asistencias Detalladas
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Tarjetas Detalladas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Historial de Goles ({goalDetails.length})</h3>
                <Badge style={{ backgroundColor: '#0000db' }} className="text-white">
                  Total: {playerData.totalGoals} goles
                </Badge>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Minuto</TableHead>
                    <TableHead>Tipo de Gol</TableHead>
                    <TableHead>Rival</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalDetails.map((goal, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{goal.match}</TableCell>
                      <TableCell>{goal.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{goal.minute}</Badge>
                      </TableCell>
                      <TableCell>{goal.type}</TableCell>
                      <TableCell>{goal.opponent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="assists" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Historial de Asistencias ({assistDetails.length})</h3>
                <Badge style={{ backgroundColor: '#FF8C00' }} className="text-white">
                  Total: {playerData.totalAssists} asistencias
                </Badge>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Minuto</TableHead>
                    <TableHead>Receptor</TableHead>
                    <TableHead>Rival</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assistDetails.map((assist, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{assist.match}</TableCell>
                      <TableCell>{assist.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assist.minute}</Badge>
                      </TableCell>
                      <TableCell>{assist.receiver}</TableCell>
                      <TableCell>{assist.opponent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Historial de Tarjetas ({cardDetails.length})</h3>
                <div className="flex space-x-2">
                  <Badge className="bg-yellow-500 text-white">
                    Amarillas: {playerData.yellowCards}
                  </Badge>
                  <Badge className="bg-red-500 text-white">
                    Rojas: {playerData.redCards}
                  </Badge>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Minuto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Rival</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cardDetails.map((card, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{card.match}</TableCell>
                      <TableCell>{card.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{card.minute}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={card.type === 'Amarilla' ? 'bg-yellow-500' : 'bg-red-500'} 
                        >
                          {card.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{card.reason}</TableCell>
                      <TableCell>{card.opponent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};