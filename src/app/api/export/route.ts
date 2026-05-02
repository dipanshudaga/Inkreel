import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  try {
    const entries = await db.select().from(media).where(eq(media.userId, userId));
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: userId,
        name: session.user.name,
      },
      entries,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="inkreel-export.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
