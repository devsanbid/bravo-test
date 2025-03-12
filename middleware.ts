import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/server/appwrite";

// Define public routes
const publicRoutes = ["/", "/login", "/register", "/forgotpassword"];

async function getUserAndRole(request: NextRequest) {
  try {
    // Get the cookie store from Next.js
    const cookieStore = await cookies();
    const sessionName = `a_session_${process.env.NEXT_PUBLIC_PROJECTID}`;
    
    if (!cookieStore.has(sessionName)) {
      console.log("No session cookie found");
      return { user: null, role: null };
    }
    
    // Create a client with the user's session
    const { account, databases } = await createSessionClient();
    
    // Get the user
    let user;
    try {
      user = await account.get();
      console.log("User fetched:", user.$id);
    } catch (error) {
      console.log("Failed to get user:", error);
      return { user: null, role: null };
    }
    
    // Get the user's profile
    let profile;
    try {
      // Make sure we have the correct database and collection IDs
      const databaseId = process.env.NEXT_PUBLIC_DATABASEID;
      const collectionId = process.env.NEXT_PUBLIC_COLLECTID;
      
      if (!databaseId || !collectionId) {
        console.log("Missing database or collection ID in environment variables");
        return { user, role: null };
      }
      
      // Get all documents and filter manually to avoid query syntax errors
      const profileResponse = await databases.listDocuments(
        databaseId,
        collectionId
      );
      
      // Find the profile that matches the user ID
      profile = profileResponse.documents.find(doc => doc.userId === user.$id);
      console.log("Profile fetched:", profile?.role || "No role found");
    } catch (error) {
      console.log("Failed to get profile:", error);
      // If there's a database error, we should still allow the user to access public routes
      return { user, role: null };
    }
    
    return { user, role: profile?.role || null };
  } catch (error) {
    console.error("Error in getUserAndRole:", error);
    return { user: null, role: null };
  }
}

export async function middleware(request: NextRequest) {
  console.log("Running middleware for:", request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  
  try {
    const { user, role } = await getUserAndRole(request);
    const isAdminRoute = pathname.startsWith("/admin");
    const isModRoute = pathname.startsWith("/mod");
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAuthRoute = ["/login", "/register", "/forgotpassword"].includes(pathname);

    // Redirect authenticated users away from auth pages
    if (user && isAuthRoute) {
      console.log("Authenticated user tried to access auth page, redirecting to dashboard");
      // Redirect based on role
      if (role) {
        switch (role) {
          case "admin":
            return NextResponse.redirect(new URL("/admin", request.url));
          case "mod":
            return NextResponse.redirect(new URL("/mod", request.url));
          default:
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } else {
        // Default to dashboard if no role
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Unauthenticated users
    if (!user) {
      console.log("User not authenticated");
      if (isDashboardRoute || isAdminRoute || isModRoute) {
        console.log("Redirecting unauthenticated user to login");
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.next();
    }

    // Authenticated users with no role (database error or new user)
    if (!role) {
      console.log("User authenticated but no role found");
      // Allow access to dashboard but not admin or mod routes
      if (isAdminRoute || isModRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Authenticated users with role
    console.log("User authenticated with role:", role);

    // Role-based access control for protected routes
    if (isAdminRoute && role !== "admin") {
      console.log("Non-admin tried to access admin route, redirecting to appropriate dashboard");
      const redirectPath = role === "mod" ? "/mod" : "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (isModRoute && role !== "mod") {
      console.log("Non-mod tried to access mod route, redirecting to appropriate dashboard");
      const redirectPath = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (isDashboardRoute && role !== "student") {
      const redirectPath = role === "mod" ? "/mod" : "/admin";
      console.log("Non-student tried to access dashboard, redirecting to:", redirectPath);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    console.log("Proceeding with request");
    return NextResponse.next();
  } catch (error) {
    // If an error occurs, log it and return next() to avoid blocking the request
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
