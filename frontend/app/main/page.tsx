"use client";

import { useAuth } from "@/hooks/MyContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MainPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to the Main Page</h1>
      <p className="mt-4 text-lg">You are logged in!</p>
      <Button onClick={handleLogout} className="mt-8">
        Logout
      </Button>
    </div>
  );
}