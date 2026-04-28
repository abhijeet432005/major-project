"use server";

import { getDbConnection } from "@/lib/db";
import { generateSummaryFromGemini } from "@/lib/gemini";
import { fetchANdExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { splitTextIntoChunks } from "@/lib/chunk-text";
import { DEMO_PDF_SUMMARY } from "@/lib/DEMO_PDF_SUMMARY"
import { getOrCreateDbUserId } from "@/lib/user";


interface PdfSummary {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function getPsfText({
  fileUrl,
  fileName,
}: {
  fileUrl: string;
  fileName: string;
}) {
  if (!fileUrl) {
    return {
      success: false,
      message: "File Upload failed",
      data: null,
    };
  }
}

// export async function generatePdfSummary({
//   fileUrl,
//   fileName,
// }: {
//   fileUrl: string;
//   fileName: string;
// }) {
//   if (!fileUrl) {
//     return {
//       success: false,
//       message: "File Upload failed",
//       data: null,
//     };
//   }

 
//   if (!fileUrl) {
//     return {
//       success: false,
//       message: "File Upload failed",
//       data: null,
//     };
//   }

//   try {
//     const pdfText = await fetchANdExtractPdfText(fileUrl);
//     console.log({ pdfText });

//     let summary;
//     try {
//       summary = await generateSummaryFromGemini(pdfText);
//       console.log({ summary });
//     } catch (error) {
//       console.log(error);
//       //call gemini-AI
//       if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
//         try {
//           summary = await generateSummaryFromOpenAI(pdfText);
//         } catch (geminiError) {
//           console.log(
//             "Gemini API failed after OPENAI quote exceeded",
//             geminiError
//           );
//           throw new Error(
//             "Failed to generate summary with available AI providers"
//           );
//         }
//       }
//     }
//     if (!summary) {
//       return {
//         success: false,
//         message: "File to generate summary",
//         data: null,
//       };
//     }

//     const formattedFileName = formatFileNameAsTitle(fileName);

//     return {
//       success: true,
//       message: "Summary generated successfully",
//       data: {
//         title: formattedFileName,
//         summary,
//       },
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message: "File Upload failed",
//       data: null,
//     };
//   }
// }

export async function generatePdfSummary({
  fileUrl,
  fileName,
}: {
  fileUrl: string;
  fileName: string;
}) {
  if (!fileUrl) {
    return {
      success: false,
      message: "File Upload failed",
      data: null,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      success: true,
      message: "Summary generated (demo mode)",
      data: {
        title: formatFileNameAsTitle(fileName),
        summary: DEMO_PDF_SUMMARY,
      },
    };
  }

  try {
    const pdfText = await fetchANdExtractPdfText(fileUrl);
    const chunks = await splitTextIntoChunks(pdfText);

    const chunkSummaries: string[] = [];

    for (const chunk of chunks) {
      let chunkSummary: string | null = null;

      // 👉 FIRST TRY: Gemini
      try {
        chunkSummary = await generateSummaryFromGemini(chunk);
      } catch (geminiErr) {
        console.log("Gemini failed, trying OpenAI");
        // 👉 FALLBACK: OpenAI
        try {
          chunkSummary = await generateSummaryFromOpenAI(chunk);
        } catch (openaiErr) {
          console.log("OpenAI also failed, skipping chunk");
        }
      }

      if (chunkSummary) {
        chunkSummaries.push(chunkSummary);
      }

      // 👉 rate-limit protection
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!chunkSummaries.length) {
      return {
        success: false,
        message: "AI quota exceeded. Please try again later.",
        data: null,
      };
    }

    // 👉 FINAL SUMMARY (safe)
    let finalSummary: string | null = null;

    try {
      finalSummary = await generateSummaryFromGemini(
        chunkSummaries.join("\n")
      );
    } catch {
      finalSummary = await generateSummaryFromOpenAI(
        chunkSummaries.join("\n")
      );
    }

    if (!finalSummary) {
      return {
        success: false,
        message: "Failed to generate final summary",
        data: null,
      };
    }

    const formattedFileName = formatFileNameAsTitle(fileName);

    return {
      success: true,
      message: "Summary generated successfully",
      data: {
        title: formattedFileName,
        summary: finalSummary,
      },
    };
  } catch (err) {
    console.log("Summary generation error:", err);
    return {
      success: false,
      message: "Failed to generate PDF summary",
      data: null,
    };
  }
}

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: {
  userId: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}) {
  const sql = await getDbConnection();

  const [savedSummary] = await sql`
    INSERT INTO pdf_summaries (
      user_id,
      original_file_url,
      summary_text,
      title,
      file_name
    )
    VALUES (
      ${userId},
      ${fileUrl},
      ${summary},
      ${title},
      ${fileName}
    )
    RETURNING id, summary_text
  `;

  return savedSummary;
}



export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: {
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}) {
  try {
    const { userId: clerkUserId } = await auth();
    const user = await currentUser();

    if (!clerkUserId || !user?.emailAddresses?.[0]?.emailAddress) {
      return { success: false, message: "User not authenticated" };
    }

    const dbUserId = await getOrCreateDbUserId({
      clerkUserId,
      email: user.emailAddresses[0].emailAddress,
      fullName: user.fullName ?? "Demo User",
    });

    const savedSummary = await savePdfSummary({
      userId: dbUserId, // ✅ UUID
      fileUrl,
      summary,
      title,
      fileName,
    });

    console.log("💾 SAVED SUMMARY:", savedSummary);

    revalidatePath(`/summaries/${savedSummary.id}`);

    return {
      success: true,
      message: "PDF Summary saved Successfully",
      data: { id: savedSummary.id },
    };
  } catch (error) {
    console.error("❌ Error saving PDF Summary:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error Saving PDF Summary",
    };
  }
}
