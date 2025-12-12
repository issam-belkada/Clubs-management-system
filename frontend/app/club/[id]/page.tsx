"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Link as LinkIcon,
  Mail,
  Calendar,
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  Check,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/MyContext";
import { EventCard } from "@/components/event-card";
import { Event } from "@/lib/types"; // Ensure Event type is available or define locally if needed

interface Club {
  id: number;
  name: string;
  description: string;
  logo_url: string | null;
  border_image: string | null;
  location: string | null;
  website_url: string | null;
  contact_email: string | null;
  established_date: string | null;
  followersCount: number; // Assuming backend provides this or we fetch separately
  isFollowing: boolean;   // Assuming backend provides this
  created_by: number;
}

export default function ClubProfilePage() {
  const params = useParams();
  const clubId = params.id;
  const { token, user } = useAuth();
  
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<any[]>([]); // Using any for posts/events mixed feed for now
  const [loading, setLoading] = useState(true);
  const [membersCount, setMembersCount] = useState(0);

  const [membershipStatus, setMembershipStatus] = useState<'none' | 'pending' | 'approved'>('none');

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    async function fetchClubData() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch Club Details
        const clubRes = await axios.get(`http://localhost:8000/api/clubs/${clubId}`, { headers });
        let clubData = clubRes.data.data;
        
        // Fetch Events/Posts (Simulating a feed)
        const eventsRes = await axios.get(`http://localhost:8000/api/clubs/${clubId}/events`, { headers });
        
        if (token) {
            try {
                const submissionsRes = await axios.get(`http://localhost:8000/api/submissions/clubs`, { headers });
                const mySubmission = submissionsRes.data.club_submissions.find((sub: any) => sub.club_id == clubId);
                if (mySubmission) {
                    setMembershipStatus(mySubmission.status);
                } else {
                    setMembershipStatus('none');
                }
            } catch (e) {
                console.error("Failed to fetch membership status", e);
            }
        }
        
        setClub(clubData);
        setEvents(eventsRes.data.data.data|| []);
        setMembersCount(1234); // Mock for now

      } catch (error) {
        console.error("Failed to fetch club data", error);
      } finally {
        setLoading(false);
      }
    }

    if (clubId) {
      fetchClubData();
    }
  }, [clubId, token]);

  const handleJoinClick = () => {
      if (!token) {
          alert("Please login to join clubs");
          return;
      }
      setIsJoinModalOpen(true);
  };

  const submitJoinRequest = async () => {
      try {
          await axios.post(`http://localhost:8000/api/submissions/clubs`, {
              club_id: clubId,
              form_data: { message: joinMessage }
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMembershipStatus('pending');
          setIsJoinModalOpen(false);
          setJoinMessage("");
      } catch (error) {
          console.error("Failed to join club", error);
          alert("Failed to send join request");
      }
  };

  const handleFollow = async () => {
    if (!token) {
        alert("Please login to follow clubs");
        return;
    }
    if (!club) return;

    // Optimistic update
    const previousState = { ...club };
    const newIsFollowing = !club.isFollowing;
    setClub({ 
        ...club, 
        isFollowing: newIsFollowing,
        followersCount: newIsFollowing ? (club.followersCount || 0) + 1 : (club.followersCount || 0) - 1
    });

    try {
      if (newIsFollowing) {
          await axios.post(`http://localhost:8000/api/clubs/${clubId}/follow`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
      } else {
          // Unfollow endpoint might be delete or post
          await axios.delete(`http://localhost:8000/api/clubs/${clubId}/unfollow`, {
              headers: { Authorization: `Bearer ${token}` }
          });
      }
    } catch (error) {
      console.error("Follow action failed", error);
      setClub(previousState); // Revert
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!club) return <div className="flex justify-center items-center h-screen">Club not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Join Request Modal */}
       {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Join {club.name}</h2>
            <p className="mb-2 text-sm text-gray-600">Please provide a message or reason for joining:</p>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={4}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="I would like to join because..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
              <Button onClick={submitJoinRequest}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full bg-gray-300 overflow-hidden">
        {club.border_image ? (
            <img 
                src={club.border_image} 
                alt="Cover" 
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
            {/* Profile Header Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-20 mb-6 gap-6">
                
                {/* Profile Picture */}
                <div className="relative">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full ring-4 ring-white dark:ring-gray-900 overflow-hidden bg-white shadow-lg">
                        {club.logo_url ? (
                            <img src={club.logo_url} alt={club.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                                {club.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Name and Stats */}
                <div className="flex-1 mt-4 md:mt-0 md:pb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{club.name}</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-200">{membersCount} <span className="font-normal text-gray-500">Members</span></span>
                        {/* <span className="font-semibold text-gray-900 dark:text-gray-200">{club.followersCount || 0} <span className="font-normal text-gray-500">Followers</span></span> */}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4 md:mt-0 md:pb-4">
                    <Button 
                        onClick={handleFollow} 
                        variant={club.isFollowing ? "secondary" : "default"}
                        className={club.isFollowing ? "" : "bg-blue-600 hover:bg-blue-700"}
                    >
                        {club.isFollowing ? (
                            <>
                                <Check className="w-4 h-4 mr-2" /> Following
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" /> Follow
                            </>
                        )}
                    </Button>
                    {membershipStatus === 'none' && (
                        <Button onClick={handleJoinClick} className="bg-green-600 hover:bg-green-700 text-white">
                            Join Club
                        </Button>
                    )}
                    {membershipStatus === 'pending' && (
                        <Button disabled variant="secondary">
                            Request Pending
                        </Button>
                    )}
                    {membershipStatus === 'approved' && (
                        <Button disabled variant="outline" className="border-green-500 text-green-500">
                            <Check className="w-4 h-4 mr-2" /> Member
                        </Button>
                    )}
                    <Button variant="secondary">
                        <MessageCircle className="w-4 h-4 mr-2" /> Message
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-700 bg-transparent h-auto p-0 rounded-none space-x-6">
                    <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3 px-1 text-base bg-transparent shadow-none">
                        Posts
                    </TabsTrigger>
                    <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3 px-1 text-base bg-transparent shadow-none">
                        About
                    </TabsTrigger>
                    <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3 px-1 text-base bg-transparent shadow-none">
                        Events
                    </TabsTrigger>
                    <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 py-3 px-1 text-base bg-transparent shadow-none">
                        Members
                    </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    {/* Left Sidebar (Desktop) */}
                    <div className="hidden lg:block space-y-6">
                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                             <h3 className="font-bold text-lg mb-4">Intro</h3>
                             <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">{club.description}</p>
                             <div className="space-y-3">
                                {club.location && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                                        {club.location}
                                    </div>
                                )}
                                {club.website_url && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <LinkIcon className="w-5 h-5 mr-3 text-gray-400" />
                                        <a href={club.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                            {club.website_url}
                                        </a>
                                    </div>
                                )}
                                {club.contact_email && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                                        {club.contact_email}
                                    </div>
                                )}
                                {club.established_date && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                        Established {new Date(club.established_date).toLocaleDateString()}
                                    </div>
                                )}
                             </div>
                         </div>
                    </div>

                    {/* Main Feed / Content */}
                    <div className="lg:col-span-2">
                        <TabsContent value="posts" className="mt-0 space-y-6">
                             {/* Create Post Input (Placeholder) */}
                             {user && (
                                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4">
                                     <Avatar>
                                         <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                         Write something to the club...
                                     </div>
                                 </div>
                             )}

                             {events.length > 0 ? (
                                 events.map(event => (
                                     <EventCard key={event.id} event={{
                                         ...event,
                                         // Adapt fields if API response differs from EventCard expectations
                                         id: event.id,
                                         post_title: event.title || event.name,
                                         post_description: event.description,
                                         likes_count: event.likes_count || 0,
                                         created_by: event.created_by || 0, // Placeholder
                                         event_type_name: "Event", // Placeholder
                                         created_at: event.created_at
                                     }} />
                                 ))
                             ) : (
                                 <div className="text-center py-10 text-gray-500">No posts yet.</div>
                             )}
                        </TabsContent>

                        <TabsContent value="about" className="mt-0">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:hidden">
                                 {/* Mobile About View (Duplicate of Sidebar) */}
                                 <h3 className="font-bold text-lg mb-4">About {club.name}</h3>
                                 <p className="text-gray-600 dark:text-gray-300 mb-6">{club.description}</p>
                                 <div className="space-y-3">
                                    {/* Same details as sidebar */}
                                     {club.location && <div>Location: {club.location}</div>}
                                     {/* ... */}
                                 </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="events" className="mt-0">
                             {/* Dedicated Events List */}
                             <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y dark:divide-gray-700">
                                {events.map(event => (
                                    <div key={event.id} className="p-4 flex gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 bg-red-100 text-red-600 rounded-lg flex flex-col items-center justify-center font-bold">
                                            <span className="text-xs uppercase">{new Date(event.start_time || event.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl">{new Date(event.start_time || event.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{event.title || event.name}</h4>
                                            <p className="text-sm text-gray-500">{new Date(event.start_time || event.date).toLocaleTimeString()} • {event.location || "Online"}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" variant="outline">Interested</Button>
                                                <Button size="sm">Going</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
