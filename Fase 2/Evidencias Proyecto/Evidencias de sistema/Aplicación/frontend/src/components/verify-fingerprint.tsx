import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { fingerprintService } from "../services/fingerprintService";
import { useAuth } from "../contexts/authContext";
import { assistReunion } from "../services/reunionService";

export default function VerifyFingerprintForReunion({ reunionId, onMatch, onClose }) {
  const [sample, setSample] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const hasSampleRef = useRef(false);
  const mountedRef = useRef(true);
  const { email, token } = useAuth();

  const MAX_SAMPLES = 1;

  async function startCapture() {
    try {
      const readers = await fingerprintService.listReaders();
      if (!readers || readers.length === 0) {
        toast.error("No se encontró ningún lector de huellas.");
        return;
      }

      setSample(null);
      hasSampleRef.current = false;  // <--- important
      setCapturing(true);

      await fingerprintService.startCapture(
        (data) => {
          if (!mountedRef.current) return;
          const onlyBase64 = data?.Data;
          if (!onlyBase64) return;

          if (!hasSampleRef.current) {
            hasSampleRef.current = true;   // prevents more than 1 capture
            setSample(onlyBase64);
          }
        },
        readers[0]
      );
    } catch (err) {
      console.error(err);
      toast.error("Error iniciando la captura");
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    startCapture();

    return () => {
      mountedRef.current = false;
      fingerprintService.stopCapture();
    };
  }, []);

  useEffect(() => {
    if (sample && capturing) {
      fingerprintService.stopCapture();
      setCapturing(false);
    }
  }, [sample, capturing]);

  async function verify() {
    if (!sample) {
      toast.error("No hay muestra para verificar.");
      return;
    }

    try {
      const result = await fingerprintService.verifyFingerprint(sample, email);
      if (result.status !== "ok") {
        toast.error("No hubo coincidencia de huella.");
        return;
      }

      const payload = {
        rut_usuario: result.rut_usuario,
        id_reunion: reunionId,
        hora_llegada: new Date().toISOString(),
        hora_salida: null
      };

      await assistReunion(payload, token);

      toast.success(`Asistencia registrada: ${result.nombre ?? result.rut_usuario}`);

      onMatch(result);

      setSample(null);

      await startCapture();

    } catch (err: any) {
      toast.error(String(err) ?? "Error verificando o registrando asistencia");
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verificar huella</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="border-2 border-dashed p-6 text-center rounded-lg">
          <p>Coloque el dedo en el lector</p>
          <p className="text-sm text-gray-500">
            Recolectando {sample ? 1 : 0}/{MAX_SAMPLES}
          </p>
        </div>

        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#0000db] rounded-full"
            style={{ width: sample ? "100%" : "0%" }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!sample}
            onClick={verify}
          >
            Verificar
          </Button>

          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
