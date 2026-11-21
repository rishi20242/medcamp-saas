import DashboardLayout from "../../components/DashboardLayout";
import NurseTerminal from "./NurseTerminal";

export default function NursePage({ params }: { params: { campCode: string } }) {
  return (
    <DashboardLayout requiredRole="NURSE" campCode={params?.campCode}>
      <NurseTerminal />
    </DashboardLayout>
  );
}
