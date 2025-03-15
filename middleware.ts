import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

// Define public routes
const publicRoutes = ["/", "/login", "/register", "/forgotpassword"];

async function getUserAndRole(request: NextRequest) {
	try {
		const sessionName = "bravo-session";
		const sessionCookie = request.cookies.get(sessionName);

		if (!sessionCookie) {
			console.log("No session cookie found");
			return null;
		}

		const token = sessionCookie.value;
		const user = await verifyJWT(token);

		if (!user) {
			return null;
		}

		return user;
	} catch (error) {
		console.error("Error in getUserAndRole:", error);
		return null;
	}
}

export async function middleware(request: NextRequest) {
	console.log("Running middleware for:", request.nextUrl.pathname);
	const { pathname } = request.nextUrl;

	try {
		const user = await getUserAndRole(request);
		console.log("middleware user: ", user);
    console.log("your role", user?.payload.role);
		const isAdminRoute = pathname.startsWith("/admin");
		const isModRoute = pathname.startsWith("/mod");
		const isDashboardRoute = pathname.startsWith("/dashboard");
		const isAuthRoute = ["/login", "/register", "/forgotpassword"].includes(
			pathname,
		);

		// Redirect authenticated users away from auth pages
		if (user && isAuthRoute) {
			console.log(
				"Authenticated user tried to access auth page, redirecting to dashboard",
			);
			// Redirect based on role
			if (user.payload.role) {
				switch (user.payload.role) {
					case "admin":
						return NextResponse.redirect(new URL("/admin", request.url));
					case "mod":
						return NextResponse.redirect(new URL("/mod", request.url));
					default:
						return NextResponse.redirect(new URL("/dashboard", request.url));
				}
			} else {
				return NextResponse.redirect(new URL("/", request.url));
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

    const role = user.payload.role

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
