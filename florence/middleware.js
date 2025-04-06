// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("token")?.value;

    if (!token && request.nextUrl.pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && request.nextUrl.pathname === "/login") {
        try {
            // Verify token client-side (optional, since backend does it)
            return NextResponse.redirect(new URL("/", request.url));
        } catch (e) {
            // Invalid token, let them stay on login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login"], // Apply to these routes
};