import DashboardLayout from "../../components/DashboardLayout";
import PharmacyTerminal from "./PharmacyTerminal";

export default function PharmacyPage({ params }: { params: { campCode: string } }) {
  return (
    <DashboardLayout requiredRole="PHARMACIST" campCode={params?.campCode}>
      <PharmacyTerminal />
    </DashboardLayout>
  );
}
