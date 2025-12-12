import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Define role-based access for routes
const roleAccess: Record<string, string[]> = {
  admin: ['/admin', '/admin/dashboard','/main'],
  club:['/club','club/dashboard','/main'],
  user: ['/dashboard', '/profile','/main'],
};

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let decoded: TokenPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const pathname = req.nextUrl.pathname;

  // -----------------------------
  // 🔥 ADMIN ROUTES PROTECTION
  // -----------------------------
  if (pathname.startsWith("/admin")) {
    if (decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

 

  // -----------------------------
  // 🔒 USER ROUTES (optional)
  // -----------------------------
  
}

// Match all routes you want to protect
export const config = {
  matcher: [
     // authenticated
        // authenticated
    "/admin/:path*",       // admin only
       
  ],
};
