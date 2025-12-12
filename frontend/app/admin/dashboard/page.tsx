"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { storage } from "@/lib/storage";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    clubs: 0,
    pendingClubs: 0,
    pendingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = storage.getToken();
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        };
        const baseUrl = "http://localhost:8000/api";

        const [usersRes, clubsRes, pendingClubsRes, pendingEventsRes] = await Promise.all([
          fetch(`${baseUrl}/users`, { headers }),
          fetch(`${baseUrl}/clubs`, { headers }),
          fetch(`${baseUrl}/submissions/clubs`, { headers }),
          fetch(`${baseUrl}/submissions/events`, { headers }),
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : [];
        const clubsData = clubsRes.ok ? await clubsRes.json() : [];
        const pendingClubsData = pendingClubsRes.ok ? await pendingClubsRes.json() : [];
        const pendingEventsData = pendingEventsRes.ok ? await pendingEventsRes.json() : [];

        // Handle potential pagination structures (data.data) or direct arrays
        const usersCount = Array.isArray(usersData) ? usersData.length : (usersData.data?.length || 0);
        const clubsCount = Array.isArray(clubsData) ? clubsData.length : (clubsData.data?.length || 0);
        const pClubsCount = Array.isArray(pendingClubsData) ? pendingClubsData.length : (pendingClubsData.data?.length || 0);
        const pEventsCount = Array.isArray(pendingEventsData) ? pendingEventsData.length : (pendingEventsData.data?.length || 0);

        setStats({
          users: usersCount,
          clubs: clubsCount,
          pendingClubs: pClubsCount,
          pendingEvents: pEventsCount,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to the system administration panel. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.users}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs Active</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.clubs}</div>
            <p className="text-xs text-muted-foreground">
              Approved and active clubs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Club Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingClubs}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Event Approvals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
               Events needing approval
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
               Select "Submissions" in the sidebar to review pending requests.
            </CardContent>
          </Card>
           <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
             <CardContent>
               <div className="flex items-center space-x-2">
                 <div className="h-3 w-3 rounded-full bg-green-500"></div>
                 <span className="text-sm font-medium">All Systems Operational</span>
               </div>
               <div className="mt-4 text-sm text-muted-foreground">
                  Database: Connected<br/>
                  API: Online
               </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}