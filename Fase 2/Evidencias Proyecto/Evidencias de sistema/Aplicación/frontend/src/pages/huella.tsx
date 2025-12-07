import React, { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { fingerprintService } from "../services/fingerprintService";
import { getUsers } from "../services/usuarioService";
import { getClubs } from "../services/clubServices";
import { useAuth } from "../contexts/authContext";
import type { ClubType, UsuarioType } from "../types";

export const HuellaModule: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UsuarioType[]>([]);
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<UsuarioType | null>(null);
  const [fingerFilter, setFingerFilter] = useState<"all" | "with" | "without">("all");
  const [samples, setSamples] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);

  const MAX_SAMPLES = 4;
  const mountedRef = useRef(true);

  useEffect(() => {
    fetchUsers();
  }, [selectedClub, search]);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    setSamples([]);
    setCapturing(false);
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const resp = await getUsers<any[]>(token, {
        limit: 9999,
        skip: 0,
        club: selectedClub && selectedClub !== "all"
          ? Number(selectedClub)
          : undefined
      });
      setUsers(resp.items);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const filteredUsers = users
    .filter(u =>
      u.nombre_usuario.toLowerCase().includes(search.toLowerCase()) ||
      u.email_usuario.toLowerCase().includes(search.toLowerCase())
    )
    .filter(u => {
      if (fingerFilter === "with") return u.huella_indice != null;
      if (fingerFilter === "without") return u.huella_indice == null;
      return true;
    });

  const fetchClubs = async () => {
    let data: ClubType[] = [];
    try {
      data = await getClubs(token);
      console.log(data);
      setClubs(data.items);
      if (data.length === 0) toast.info("No hay clubes registrados en la base de datos.");
    } catch (err: any) {
      console.error(err);
      toast.warning(String(err));
    } finally {
      if (data.length === 0) setClubs([]);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!selectedUser) return;

    const start = async () => {
      try {
        const readers = await fingerprintService.listReaders();
        if (!readers || readers.length === 0) {
          toast.error("No se encontro ningun lector de huellas digitales.");
          return;
        }

        // ensure fresh state
        setSamples([]);
        setCapturing(true);

        await fingerprintService.startCapture(
          (sample) => {
            if (!mountedRef.current) return;

            const onlyBase64 = sample?.Data;
            if (!onlyBase64 || typeof onlyBase64 !== "string") return;

            setSamples((prev) => {
              if (prev.length >= MAX_SAMPLES) return prev;
              return [...prev, onlyBase64];
            });
          },
          readers[0]
        );
      } catch (err) {
        console.error("Error starting capture:", err);
      }
    };

    start();

    return () => {
      mountedRef.current = false;
      fingerprintService.stopCapture();
    };
  }, [selectedUser]);

  // Stop capture after 4 samples
  useEffect(() => {
    if (samples.length >= MAX_SAMPLES && capturing) {
      fingerprintService.stopCapture();
      setCapturing(false);
    }
  }, [samples, capturing]);

  const completeEnrollment = async () => {
    if (!selectedUser) return toast.info("Seleccione un usuario");
    if (samples.length === 0) return toast.error("No hay muestras");

    try {
      const res = await fetch("http://localhost:8000/huella/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email_usuario,
          index_finger: samples,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Huella registrada");
        fetchUsers();
        setSelectedUser(null);
        setSamples([]);
      } else {
        toast.error("Error: " + (json.detail || JSON.stringify(json)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetEnrollment = async () => {
    if (!selectedUser) {
      toast.info("Seleccione un usuario primero.");
      return;
    }

    try {
      // Stop any ongoing capture
      await fingerprintService.stopCapture();

      // Clear samples and state
      setSamples([]);
      setCapturing(false);

      // List available readers again
      const readers = await fingerprintService.listReaders();
      if (!readers || readers.length === 0) {
        toast.error("No se encontró ningún lector de huellas.");
        return;
      }

      // Restart capture
      setCapturing(true);

      await fingerprintService.startCapture(
        (sample) => {
          if (!mountedRef.current) return;

          const onlyBase64 = sample?.Data;
          if (!onlyBase64 || typeof onlyBase64 !== "string") return;

          setSamples((prev) => {
            if (prev.length >= MAX_SAMPLES) return prev;
            return [...prev, onlyBase64];
          });
        },
        readers[0]
      );

      toast.info("Proceso de registro reiniciado.");
    } catch (err) {
      console.error("Error in resetEnrollment:", err);
      toast.error("Error reiniciando el proceso.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Huellas Dactilares</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE: USERS LIST */}
        <Card>
          <CardHeader><CardTitle>Usuarios</CardTitle></CardHeader>
          <CardContent>

            <div className="mb-4">
              <label className="block mb-1">Buscar por nombre o email</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="Ej: Juan, Maria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="mb-4">
                <label className="block mb-1">Filtrar por Club</label>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger><SelectValue placeholder="Todos los clubs" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {clubs.map((c) => (
                      <SelectItem key={c.id_club} value={String(c.id_club)}>
                        {c.nombre_club}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Filtrar por estado</label>
                <Select value={fingerFilter} onValueChange={(v) => setFingerFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado de huella" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with">Con huella registrada</SelectItem>
                    <SelectItem value="without">Sin huella</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Users list */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.email_usuario} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.nombre_usuario}</p>
                    <p className="text-sm text-gray-600">{user.email_usuario}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.huella_indice != null ? (
                      <Badge className="bg-green-500 text-white">Registrado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 border-red-500">Pendiente</Badge>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.huella_indice ? "Cambiar" : "Registrar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT SIDE: ENROLLMENT */}
        <Card>
          <CardHeader><CardTitle>Proceso de Registro</CardTitle></CardHeader>
          <CardContent>

            {!selectedUser && (
              <p className="text-gray-500">Seleccione un usuario para iniciar el registro.</p>
            )}

            {selectedUser && (
              <div className="mb-4">
                <p className="text-lg font-semibold">{selectedUser.nombre_usuario}</p>
                <p className="text-sm text-gray-600">{selectedUser.email_usuario}</p>
              </div>
            )}

            {selectedUser && (
              <div className="space-y-6">

                <div className="border-2 border-dashed p-8 text-center rounded-lg">
                  <p className="font-medium mb-2">Coloque el dedo en el lector</p>
                  <p className="text-sm">Presione firmemente durante la captura</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span>{samples.length}/{MAX_SAMPLES}</span>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-[#0000db] rounded-full"
                      style={{ width: `${(samples.length / MAX_SAMPLES) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full"
                    style={{ backgroundColor: "#0000db" }}
                    disabled={samples.length < MAX_SAMPLES}
                    onClick={completeEnrollment}
                  >
                    Completar Registro
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetEnrollment}
                  >
                    Reiniciar Proceso
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};
