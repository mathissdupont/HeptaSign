import { NextRequest } from "next/server";
import { redirectTo } from "@/lib/redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const documentCode = String(form.get("documentCode") || "").trim();
  if (!documentCode) return redirectTo("/verify?error=missing");
  return redirectTo(`/verify?documentCode=${encodeURIComponent(documentCode)}`);
}
