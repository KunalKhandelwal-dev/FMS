import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/guards";
import { localStorageProvider } from "@/server/storage/localStorageProvider";
import { db } from "@/server/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  // 1. Session check - files are private and protected
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { fileId } = await context.params;

  // 2. Lookup submission metadata
  const submission = await db.workSubmission.findFirst({
    where: {
      OR: [{ id: fileId }, { filePath: { contains: fileId } }],
    },
    include: {
      task: {
        include: {
          deliverable: {
            include: { job: true },
          },
        },
      },
    },
  });

  if (!submission || !submission.filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 3. Permission check
  const isSuper = user.role === "MAIN_MANAGER";
  const isDeputy = submission.task.deliverable.job.assignedDeputyId === user.id;
  const isSubmitter = submission.submittedById === user.id;
  const isAssignee = submission.task.assignedToId === user.id;

  if (!isSuper && !isDeputy && !isSubmitter && !isAssignee) {
    return NextResponse.json({ error: "Forbidden: You cannot access this file" }, { status: 403 });
  }

  try {
    const fileBuffer = await localStorageProvider.readFile(submission.filePath);
    const mimeType = submission.mimeType || "application/octet-stream";
    const fileName = submission.fileName || "submission_file";

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("File retrieval error:", err);
    return NextResponse.json({ error: "Failed to read file from storage" }, { status: 500 });
  }
}
