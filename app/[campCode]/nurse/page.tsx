import DashboardLayout from "../../components/DashboardLayout";
import NurseTerminal from "./NurseTerminal";

export default function NursePage() {
  return (
    <DashboardLayout requiredRole="NURSE">
      <NurseTerminal />
    </DashboardLayout>
  );
}
