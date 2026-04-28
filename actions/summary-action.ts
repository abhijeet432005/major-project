"use server";

import { getDbConnection } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getOrCreateDbUserId } from "@/lib/user"; // 👈 IMPORTANT

export async function deleteSummaryAction({
  summaryId,
}: {
  summaryId: string;
}) {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("User not authenticated");
    }

    // ✅ Get DB UUID (NOT clerk id)
    const dbUserId = await getOrCreateDbUserId({
      clerkUserId: user.id,
      email: user.emailAddresses[0].emailAddress,
      fullName: user.fullName ?? "Demo User",
    });

    const sql = await getDbConnection();

    const result = await sql`
      DELETE FROM pdf_summaries
      WHERE id=${summaryId}
      AND user_id=${dbUserId}
      RETURNING id
    `;

    if (result.length > 0) {
      revalidatePath("/dashboard");
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("❌ Error Deleting Summary:", error);
    return { success: false };
  }
}