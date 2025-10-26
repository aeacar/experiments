import { StudentNavbar } from '@/components/student/Navbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
