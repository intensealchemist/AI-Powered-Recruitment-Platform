import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import { ResumeDocument } from "@/components/pdf/resume-document";
import { listCandidates } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
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
