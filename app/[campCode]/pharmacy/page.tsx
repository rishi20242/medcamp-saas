import DashboardLayout from "../../components/DashboardLayout";
import PharmacyTerminal from "./PharmacyTerminal";

export default function PharmacyPage() {
  return (
    <DashboardLayout requiredRole="PHARMACIST">
      <PharmacyTerminal />
    </DashboardLayout>
  );
}
