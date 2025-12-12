"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Briefcase, Activity, Plus } from "lucide-react";
import { storage } from "@/lib/storage";

import { useParams } from "next/navigation"; // Ensure import

export default function ClubAdminDashboard() {
  const params = useParams();
  const clubId = params.clubId;
  const [stats, setStats] = useState({
    events: 0,
    members: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const token = storage.getToken();
        if (!token) return;

        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        };
        const baseUrl = "http://localhost:8000/api";

        // 1. Get User Info to find Club (Placeholder logic)
        // Ideally we would fetch /clubs/my-club or derived from user roles
        
        const [eventsRes, projectsRes] = await Promise.all([
             fetch(`${baseUrl}/events`, { headers }), // Placeholder: Public events
             fetch(`${baseUrl}/projects`, { headers })
        ]);

        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const projectsData = projectsRes.ok ? await projectsRes.json() : [];

        setStats({
            events: Array.isArray(eventsData) ? eventsData.length : (eventsData.data?.length || 0),
            members: 0, // Hard to know without club ID
            projects: Array.isArray(projectsData) ? projectsData.length : (projectsData.data?.length || 0),
        });

      } catch (error) {
        console.error("Failed to fetch club data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Club Overview</h2>
        <p className="text-muted-foreground mt-2">
          Manage your club activities, members, and projects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.events}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.members}</div>
            <p className="text-xs text-muted-foreground">
              Club members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.projects}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h3>
        <div className="flex gap-4">
             <Link href={`/club-admin/${clubId}/dashboard/events/new`}>
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </Link>
            <Link href={`/club-admin/${clubId}/dashboard/projects/new`}>
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </Link>
            <Link href={`/club-admin/${clubId}/dashboard/tasks/new`}>
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                   <div className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">New Event Created</p>
                            <p className="text-sm text-muted-foreground">Web Development Workshop</p>
                        </div>
                        <div className="ml-auto font-medium">+2m ago</div>
                   </div>
                   <div className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">New Member Joined</p>
                            <p className="text-sm text-muted-foreground">Alice Johnson</p>
                        </div>
                        <div className="ml-auto font-medium">+1h ago</div>
                   </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}