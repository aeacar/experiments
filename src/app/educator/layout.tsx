import { EducatorNavbar } from '@/components/educator/Navbar';

export default function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <EducatorNavbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
