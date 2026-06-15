import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";

export function redirectTo(path: string) {
  const safePath = path.startsWith("/") ? path : "/dashboard";
  return NextResponse.redirect(new URL(safePath, getAppUrl()), 303);
}
