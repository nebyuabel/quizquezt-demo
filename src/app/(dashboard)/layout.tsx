import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-surface">
          <Sidebar />
          <Header />
          <div className="md:pl-64 pb-20 md:pb-0">
            <main className="relative pt-16 bg-surface min-h-screen">
              {children}
            </main>
          </div>
          <BottomNav />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
