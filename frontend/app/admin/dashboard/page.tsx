"use client";

// This file is now adapted for Next.js App Router structure
// Place it inside: app/admin/clubs/page.tsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import axios from "axios";

export default function AdminDashboardClubs() {
  const [clubs, setClubs] = useState<any[]>([]);

  const [newClubData, setNewClubData] = useState({
    name: "",
    description: "",
    logo_url: "",
    contact_email: "",
    website_url: "",
    social_media_links: "",
    location: "",
    established_date: "",
    border_image: "",
  });

  const [selectedAdmin, setSelectedAdmin] = useState<string | number>("");

  const [admins,setAdmin] = useState<any>([]);

  // Fetch clubs on mount
  useState(() => {
    let mounted = true;
    axios
      .get("http://localhost:8000/api/clubs")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (mounted) setClubs(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setClubs([]);
      });
    return () => {
      mounted = false;
    };
  });

  useEffect(() => { 
    const fetch=async()=>{
      try{
        const res1=await axios.get("http://localhost:8000/api/users");
        setAdmin(res1.data.data);
        console.log("Fetched admins:",res1.data.data);
      }catch(error){
        console.error("Error fetching admins:",error);}
    }
    fetch()
  }, []);
  const createClub = async () => {
    if (!newClubData.name || !selectedAdmin) return;

    const payload = {
      ...newClubData,
      created_by: Number(selectedAdmin),
    };

    try {
     
      const res = await axios.post("http://localhost:8000/api/clubs", {
        ...payload,
       
      });
      const created = res.data?.data ?? res.data;
      setClubs((prev) => [...prev, created]);
      setNewClubData({
        name: "",
        description: "",
        logo_url: "",
        contact_email: "",
        website_url: "",
        social_media_links: "",
        location: "",
        established_date: "",
        border_image: "",

      });
      setSelectedAdmin("");
    } catch (err) {
      console.error("Create club failed", err);
    }
  };

  const deleteClub = (id: any) => {
    // optimistic remove — you can call API to delete as well
    setClubs((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 grid gap-6"
    >
      <h1 className="text-3xl font-bold mb-4">
        Admin Dashboard – Manage Clubs
      </h1>

      {/* Create Club Section */}
      <Card className="p-4 shadow-md rounded-2xl">
        <CardContent className="grid gap-3">
          <h2 className="text-xl font-semibold">Create New Club</h2>

          <Input
            placeholder="Club name"
            value={newClubData.name}
            onChange={(e) =>
              setNewClubData({ ...newClubData, name: e.target.value })
            }
          />

          <Input
            placeholder="Short description"
            value={newClubData.description}
            onChange={(e) =>
              setNewClubData({ ...newClubData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Logo URL"
              value={newClubData.logo_url}
              onChange={(e) =>
                setNewClubData({ ...newClubData, logo_url: e.target.value })
              }
            />
            <Input
              placeholder="Border image URL"
              value={newClubData.border_image}
              onChange={(e) =>
                setNewClubData({ ...newClubData, border_image: e.target.value })
              }
            />
            <Input
              placeholder="Contact email"
              value={newClubData.contact_email}
              onChange={(e) =>
                setNewClubData({
                  ...newClubData,
                  contact_email: e.target.value,
                })
              }
            />
            <Input
              placeholder="Website URL"
              value={newClubData.website_url}
              onChange={(e) =>
                setNewClubData({ ...newClubData, website_url: e.target.value })
              }
            />
          </div>

          <Input
            placeholder="Social media links"
            value={newClubData.social_media_links}
            onChange={(e) =>
              setNewClubData({
                ...newClubData,
                social_media_links: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Location"
              value={newClubData.location}
              onChange={(e) =>
                setNewClubData({ ...newClubData, location: e.target.value })
              }
            />
            <Input
              type="date"
              value={newClubData.established_date}
              onChange={(e) =>
                setNewClubData({
                  ...newClubData,
                  established_date: e.target.value,
                })
              }
            />
          </div>

          <Select onValueChange={(v) => setSelectedAdmin(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Club Admin" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((a:any) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={createClub}
            className="w-fit flex items-center gap-2"
          >
            <PlusCircle size={18} /> Create Club
          </Button>
        </CardContent>
      </Card>

      {/* Clubs List */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Existing Clubs</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <Card key={club.id} className="p-4 shadow-sm rounded-2xl">
              <CardContent className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{club.name}</h3>
                  <p className="text-sm text-gray-500">Admin: {club.admin}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl">
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => deleteClub(club.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
