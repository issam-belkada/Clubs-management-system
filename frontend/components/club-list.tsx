"use client";

import Image from "next/image";
import { mockEvents } from "@/lib/mock-data";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { set } from "date-fns";

export function ClubList() {
  // derive unique clubs and a thumbnail from mockEvents
  const clubsMap = new Map<string, { name: string; thumb: string }>();
  const [clublist,setClublist]=useState<any>([]);
useEffect(()=>{
    const fetchClubs=async()=>{
        try{
            const res=await fetch("http://localhost:8000/api/clubs");
            const data=await res.json();
           console.log("Fetched clubs:",data.data.data);
            setClublist(data.data.data);
        }
        catch(error){
            console.error("Error fetching clubs:",error);
        }};
    fetchClubs();
},[])

  const clubs = Array.from(clubsMap.values());

  return (
    <aside className="w-72 hidden md:block">
      <div className="sticky top-20 space-y-3">
        <h2 className="text-sm font-semibold px-3">Clubs</h2>
        <div className="bg-card rounded-lg divide-y border border-border overflow-hidden">
          {clublist.map((club:any) => (
            <Link
            href={`/club/${club.id}`}
              key={club.id}
              className="flex items-center gap-3 p-3 hover:bg-muted/50"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                <Image
                  src={club.logo_url}
                  alt={club.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{club.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    5m
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Active now</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
