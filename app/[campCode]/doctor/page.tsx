import DashboardLayout from "../../components/DashboardLayout";
import DoctorTerminal from "./DoctorTerminal";

export default function DoctorPage({ params }: { params: { campCode: string } }) {
  return (
    <DashboardLayout requiredRole="DOCTOR" campCode={params?.campCode}>
      <DoctorTerminal />
    </DashboardLayout>
  );
}
