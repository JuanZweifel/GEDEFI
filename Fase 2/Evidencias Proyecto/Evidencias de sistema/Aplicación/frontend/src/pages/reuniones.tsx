import AdminMeetings from "../components/reunion-admin";
import UserMeetings from "../components/reunion-usuario";
import { useAuth } from "../contexts/authContext";

export default function ReunionesModule() {
  const { rol } = useAuth();

  return rol === "Administrador"
    ? <AdminMeetings />
    : <UserMeetings />;
}
