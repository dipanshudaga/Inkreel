import { auth } from "@/lib/auth";
import dns from "dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

// In Next.js 16, the middleware function is renamed to proxy
// It defaults to the Node.js runtime, which allows us to use bcrypt/database logic
export default async function proxy(request: any) {
  try {
    return await auth(request);
  } catch (error) {
    console.error("Auth proxy error:", error);
    return null;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
