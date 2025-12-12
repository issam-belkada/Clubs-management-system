"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation"; // Added useParams, useRouter
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Users, Briefcase, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/MyContext";
import { useState, useEffect } from "react";
import axios from "axios"; // Added axios

export default function ClubAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams(); // Get params
  const clubId = params.clubId; // Get clubId
  const { logout, user, token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null); // State for auth check
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!token || !user || !clubId) {
          return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/clubs/${clubId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.data.created_by === user.id) {
            setAuthorized(true);
        } else {
            setAuthorized(false);
        }
      } catch (error) {
        console.error("Failed to verify club ownership", error);
        setAuthorized(false);
      }
    };

    if (token && user) {
        checkAuthorization();
    }
  }, [clubId, token, user]);

  if (authorized === false) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
              <h1 className="text-4xl font-bold text-red-600 mb-4">401 - Unauthorized</h1>
              <p className="text-gray-700 mb-6">You are not the administrator of this club.</p>
              <Button onClick={() => router.push('/')}>Go Home</Button>
          </div>
      );
  }

  if (authorized === null) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const navItems = [
    {
      title: "Overview",
      href: `/club-admin/${clubId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Events",
      href: `/club-admin/${clubId}/dashboard/events`,
      icon: Calendar,
    },
    {
      title: "Members",
      href: `/club-admin/${clubId}/dashboard/members`,
      icon: Users,
    },
    {
      title: "Projects",
      href: `/club-admin/${clubId}/dashboard/projects`,
      icon: Briefcase,
    },
    {
      title: "Requests",
      href: `/club-admin/${clubId}/dashboard/requests`,
      icon: Users, // Or another suitable icon like UserPlus
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform md:translate-x-0 md:relative",
          isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-0 md:overflow-hidden"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              Club Manager
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item,i) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={i}
                  href={item.href||""}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-40">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="ml-auto flex items-center space-x-4">
                 <span className="text-sm text-gray-500">Club Admin Area</span>
            </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
