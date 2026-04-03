import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { headers } from "next/headers";

import { ResumeDocument } from "@/components/pdf/resume-document";
import { listCandidates } from "@/lib/data";
import { apiLimiter } from "@/lib/rate-limit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await apiLimiter.limit(`pdf_${ip}`);

  if (!success) {
    return new Response("Rate limit exceeded. Please wait a minute before generating more PDFs.", { status: 429 });
  }

  const { profileId } = await params;
  const candidates = await listCandidates();
  const candidate = candidates.find((item) => item.profile.id === profileId);

  if (!candidate) {
    return new Response("Profile not found.", { status: 404 });
  }

  try {
    const document = React.createElement(ResumeDocument, {
      profile: candidate.profile,
    }) as unknown as React.ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(document);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${candidate.name.replaceAll(" ", "-").toLowerCase()}-resume.pdf"`,
      },
    });
  } catch {
    return new Response("Unable to generate PDF.", { status: 500 });
  }
}
