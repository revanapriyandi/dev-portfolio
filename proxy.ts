import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/dashboard(.*)"]);

// Signing in is not enough: only Clerk user IDs listed in ADMIN_USER_IDS (comma-separated) get in.
// An empty list denies everyone, so a misconfigured deploy fails closed.
const admins = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export default clerkMiddleware(async (auth, req) => {
  if (!isAdminRoute(req)) return;
  await auth.protect(); // not signed in -> Clerk sign-in
  const { userId } = await auth();
  if (!userId || !admins.includes(userId)) {
    // show the regular 404 page: an unknown path renders app/not-found.tsx with a 404 status
    return NextResponse.rewrite(new URL("/__not-found", req.url), { status: 404 });
  }
});

// Clerk only runs for the admin area, so the public site never depends on Clerk being configured.
export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
