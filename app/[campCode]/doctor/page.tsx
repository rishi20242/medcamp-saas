import DashboardLayout from "../../components/DashboardLayout";
import DoctorTerminal from "./DoctorTerminal";

export default function DoctorPage() {
  return (
    <DashboardLayout requiredRole="DOCTOR">
      <DoctorTerminal />
    </DashboardLayout>
  );
}
