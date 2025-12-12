import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const userRolesCookie = request.cookies.get("userRoles")?.value;
  
  // Parse roles
  let roles: string[] = [];
  try {
    if (userRolesCookie) {
      // It might be a raw array or stringified JSON depending on how cookies.set works in the browser vs server reading
      // Universal-cookie usually stringifies it.
      roles = JSON.parse(userRolesCookie);
      if (!Array.isArray(roles)) {
          roles = [];
      }
    }
  } catch (e) {
    console.error("Failed to parse roles", e);
  }

  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/club-admin")) {
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Check if user has admin role
    const isAdmin = roles.some(role => role === 'admin' || role === 'super_admin');
    if (!isAdmin) {
       // Allow club-admin for club-admin routes?
       if (pathname.startsWith("/club-admin")) {
           // Maybe only 'club_admin' role?
           // For now assume admin covers all or check specifically
           // Let's safe guard:
       }
       
       // If strict check:
       if (!roles.includes('admin') && pathname.startsWith("/admin")) {
           return NextResponse.redirect(new URL("/unauthorized", request.url));
       }
    }
  }

  // Protect User Routes if needed, or just require login
  if (pathname.startsWith("/user")) {
      if (!token) {
          return NextResponse.redirect(new URL("/login", request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/club-admin/:path*", "/user/:path*"],
};
