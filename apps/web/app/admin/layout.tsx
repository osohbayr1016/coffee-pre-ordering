import AdminGateLayout from "./AdminGateLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGateLayout>{children}</AdminGateLayout>;
}
