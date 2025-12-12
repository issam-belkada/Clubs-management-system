"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Check, X, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JoinRequest {
  id: number;
  user_id: number;
  club_id: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  form_data: string; // JSON string
  user?: {
      name: string;
      email: string;
  };
}

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const { token } = useAuth();
  const params = useParams();
  const clubId = params.clubId;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && clubId) {
      fetchRequests();
    }
  }, [token, clubId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/clubs/${clubId}/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Backend returns { data: [...] }
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
        setLoading(false);
    }
  };

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
      try {
          const response = await fetch(`http://localhost:8000/api/clubs/${clubId}/requests/${requestId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status })
          });

          if (response.ok) {
              // Update local state
              setRequests(prev => prev.map(req => 
                  req.id === requestId ? { ...req, status: status } : req
              ));
          }
      } catch (error) {
          console.error("Failed to review request", error);
      }
  };

  const parseFormData = (jsonString: string) => {
      try {
          const data = JSON.parse(jsonString);
          return data.message || "No message provided";
      } catch (e) {
          return "No message provided";
      }
  };

  if(!token) return <div>Please login</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="my-8 text-4xl font-bold">Join Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 border-b">User ID</th>
              {/* Note: We might need to fetch user details if not included in the 'requests' endpoint yet. 
                  For now we show ID, or if backend includes 'user' relation we show name. */}
              <th className="px-6 py-3 text-left text-gray-500 border-b">Submitted At</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Message</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Status</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && !loading && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No pending join requests.
                    </td>
                </tr>
            )}
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                    {req.user_id}
                    {/* Add User Name lookup here if available */}
                </td>
                <td className="px-6 py-4 border-b">
                    {new Date(req.submitted_at).toLocaleDateString()} {new Date(req.submitted_at).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 border-b">
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2"/> View Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Application Message</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 bg-gray-50 rounded text-gray-700">
                                {parseFormData(req.form_data)}
                            </div>
                        </DialogContent>
                     </Dialog>
                </td>
                <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${req.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${req.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                        {req.status}
                    </span>
                </td>
                <td className="px-6 py-4 border-b">
                  {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReview(req.id, 'approved')} className="bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4"/>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReview(req.id, 'rejected')}>
                            <X className="w-4 h-4"/>
                        </Button>
                      </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
