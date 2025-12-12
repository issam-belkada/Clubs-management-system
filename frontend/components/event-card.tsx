"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CImage } from "@coreui/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/MyContext";
import axios from "axios";

interface EventPostProps {
  event: {
    id: number;
    event_id: number;
    post_title: string;
    post_description: string;
    content: string | null;
    post_image: string | null;
    post_image2: string | null;
    post_video: string | null;
    likes_count: number;
    created_by: number;
    event_type_name: string;
    club?: string; // Optional if not provided in feed directly, might need to fetch or infer
    user_liked?: boolean;
    comments?: number;
    created_at?: string;
    custom_form?: string | null; // JSON string
  };
}

export function EventCard({ event }: EventPostProps) {
  const [isLiked, setIsLiked] = useState(event.user_liked || false);
  const [likeCount, setLikeCount] = useState(event.likes_count ?? 0);
  const { token } = useAuth();

  const handleLike = async () => {
    if (!token) {
        // Handle unauthenticated state - maybe redirect or show toast
        console.warn("User not authenticated");
        return;
    }

    try {
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(newIsLiked ? likeCount + 1 : likeCount - 1);

      const endpoint = newIsLiked ? "like" : "unlike";
      // Using axios for cleaner syntax and consistency
      await axios({
        method: newIsLiked ? 'post' : 'delete',
        url: `http://localhost:8000/api/event-posts/${event.id}/${endpoint}`,
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      console.log("Event post liked/unliked successfully");
    } catch (error) {
      console.error("Error liking the event post:", error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  return (
    <Card className="w-full mb-6 bg-card border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm">
               User {event.created_by} {/* Replace with actual User or Club name if available in future */}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{event.event_type_name}</span>
               {/* Date would go here */}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-2">
        {event.post_title && <h3 className="font-semibold text-base">{event.post_title}</h3>}
         <p className="text-sm text-foreground whitespace-pre-wrap">
            {event.content || event.post_description}
         </p>
      </div>

      {/* Media */}
      <div className="w-full bg-muted/20">
        {event.post_video ? (
             <video controls className="w-full max-h-[500px] object-cover">
                 <source src={event.post_video} type="video/mp4" />
                 Your browser does not support the video tag.
             </video>
        ) : (
            (event.post_image || event.post_image2) && (
             <div className="grid grid-cols-1 gap-1">
                 {event.post_image && (
                     <img
                       src={event.post_image}
                       alt="Post content"
                       className="w-full sm:max-h-[500px] object-contain bg-black/5"
                     />
                 )}
                 {event.post_image2 && (
                    <img
                        src={event.post_image2}
                        alt="Post content 2"
                         className="w-full sm:max-h-[500px] object-contain bg-black/5"
                    />
                 )}
             </div>
            )
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/50">
        <div className="flex items-center gap-1">
            <div className="bg-primary/10 p-1 rounded-full text-primary">
                <ThumbsUp className="w-3 h-3 fill-current" />
            </div>
            <span>{likeCount}</span>
        </div>
        <div className="flex gap-3">
             <span>{event.comments || 0} comments</span>
             <span>0 shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-1">
        <Button
          variant="ghost"
          className={`flex-1 gap-2 text-muted-foreground hover:text-primary ${isLiked ? "text-primary font-medium" : ""}`}
          onClick={handleLike}
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          Like
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-primary">
          <MessageCircle className="w-5 h-5" />
          Comment
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-primary">
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div>
    </Card>
  );
}
