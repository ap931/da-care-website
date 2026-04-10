import "server-only";

import { revalidatePath } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

async function isAuthorized(request) {
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = request.headers.get(SIGNATURE_HEADER_NAME) || "";
    const body = await request.text();
    return isValidSignature(body, signature, webhookSecret);
  }

  const legacySecret = process.env.SANITY_REVALIDATE_SECRET;
  if (!legacySecret) return true;
  const provided = request.nextUrl.searchParams.get("secret");
  return provided === legacySecret;
}

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const paths = [
    "/",
    "/about",
    "/contact",
    "/article",
    "/coren",
    "/leda",
    "/leda-business",
  ];
  paths.forEach((path) => revalidatePath(path, "page"));

  return Response.json({ revalidated: true, paths, now: Date.now() });
}
