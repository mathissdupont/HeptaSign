import { NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { redirectTo } from "@/lib/redirect";

export async function POST(request: NextRequest) {
  await clearSessionCookie();
  return redirectTo("/login");
}
