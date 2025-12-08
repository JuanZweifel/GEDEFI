import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import VerifyFingerprintForReunion from "./verify-fingerprint";

export default function AttendanceCheck({ meeting, onClose }) {

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[400px] max-w-full">
        <DialogHeader>
          <DialogTitle>Asistencia: {meeting.titulo_reunion}</DialogTitle>
        </DialogHeader>

        <VerifyFingerprintForReunion
          reunionId={meeting.id_reunion}
          onMatch={() => { }}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
