"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/MyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventPost {
  id: number;
  post_title: string;
  post_description: string;
  content: string;
  post_image: string | null;
  post_video: string | null;
  created_at: string;
}

export default function ManageEventPostsPage() {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  
  const clubId = params.clubId;
  const eventId = params.eventId; // Needs to be captured from folder structure

  // Form State
  const [formData, setFormData] = useState({
    post_title: "",
    post_description: "",
    content: "",
    post_image: "",
    post_video: "",
  });

  useEffect(() => {
    if (token && eventId) {
      fetchPosts();
    }
  }, [token, eventId]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // API returns { data: [...], event: {...} }
        setPosts(data.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchPosts();
        setFormData({
            post_title: "",
            post_description: "",
            content: "",
            post_image: "",
            post_video: "",
        });
      } else {
        console.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
      if(!confirm("Are you sure you want to delete this post?")) return;

      try {
          const response = await fetch(`http://localhost:8000/api/event-posts/${postId}`, {
              method: "DELETE",
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          if(response.ok) {
              fetchPosts();
          }
      } catch (error) {
          console.error("Failed to delete post", error);
      }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2"/> Back
        </Button>
        <h1 className="text-3xl font-bold">Manage Event Posts</h1>
      </div>

      <div className="flex justify-end">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="post_title">Title</Label>
                <Input id="post_title" value={formData.post_title} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="post_description">Description</Label>
                <Input id="post_description" value={formData.post_description} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={formData.content} onChange={handleChange} rows={4} />
              </div>
              <div>
                <Label htmlFor="post_image">Image URL</Label>
                <Input id="post_image" value={formData.post_image} onChange={handleChange} placeholder="https://..." />
              </div>
               <div>
                <Label htmlFor="post_video">Video URL</Label>
                <Input id="post_video" value={formData.post_video} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Post"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
             {post.post_image && (
                 <div className="aspect-video w-full relative">
                     <img src={post.post_image} alt={post.post_title} className="object-cover w-full h-full" />
                 </div>
             )}
            <CardHeader>
              <CardTitle className="truncate">{post.post_title || "Untitled Post"}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{post.content || post.post_description}</p>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4 mr-2"/> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
                No posts found for this event.
            </div>
        )}
      </div>
    </div>
  );
}
