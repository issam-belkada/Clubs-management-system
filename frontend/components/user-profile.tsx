"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MapPin, Calendar, Mail, User as UserIcon, Camera } from "lucide-react";

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;
        
        const response = await fetch("http://localhost:8000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setName(data.name);
          setEmail(data.email);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsEditing(false);
        // You might want to show a toast here
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  if (loading) {
    return (
       <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    );
  }

  if (!user) {
    return <div className="text-center p-8 text-muted-foreground">Please log in to view your profile.</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            <Button variant="secondary" size="sm" className="absolute top-4 right-4 opacity-80 hover:opacity-100">
                <Camera className="w-4 h-4 mr-2"/> Edit Cover
            </Button>
        </div>
        <CardContent className="pt-0 relative px-6">
          <div className="flex flex-col sm:flex-row items-end -mt-12 mb-4 gap-4">
             <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                <AvatarImage src="/avatar-placeholder.png" />
                <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
             </Avatar>
             <div className="flex-1 pt-2 mt-3">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">@{user.name.replace(/\s+/g, '').toLowerCase()}</p>
             </div>
             <div className="pb-2">
                <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
                    {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
             </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4 mt-4">
              <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
              </div>
              <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date().getFullYear()} {/* Replace with actual join date if available */}
              </div>
              <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Barigou
              </div>
          </div>
          
           {/* Stats Row - Mock Data for now */}
           <div className="flex gap-6 mt-6 pb-2">
               <div className="flex flex-col items-center">
                   <span className="font-bold text-lg">0</span>
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">Posts</span>
               </div>
               <div className="flex flex-col items-center">
                   <span className="font-bold text-lg">0</span>
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">Followers</span>
               </div>
               <div className="flex flex-col items-center">
                   <span className="font-bold text-lg">0</span>
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">Following</span>
               </div>
           </div>

        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
          <Card className="animate-in fade-in slide-in-from-top-4 duration-200">
            <CardHeader>
                <CardTitle>Edit Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Display Name</Label>
                    <div className="relative">
                        <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9 px-9"
                          required
                        />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 px-9"
                          required
                        />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                  </div>
                </form>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
