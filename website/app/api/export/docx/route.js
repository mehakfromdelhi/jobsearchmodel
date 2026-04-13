import { Document, Packer, Paragraph, TextRun } from "docx";

export async function POST(request) {
  const body = await request.json();
  const title = String(body?.title || "Revised Resume").trim();
  const content = String(body?.content || "").trim();

  if (!content) {
    return Response.json({ error: "Resume content is required." }, { status: 400 });
  }

  const paragraphs = content.split(/\r?\n/).map((line) => {
    if (!line.trim()) return new Paragraph({});
    if (line === line.toUpperCase() && line.length < 80) {
      return new Paragraph({
        heading: "Heading2",
        children: [new TextRun(line)]
      });
    }
    if (line.startsWith("- ")) {
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun(line.slice(2))]
      });
    }
    return new Paragraph({
      children: [new TextRun(line)]
    });
  });

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: "Title",
            children: [new TextRun(title)]
          }),
          ...paragraphs
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(document);
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${slugify(title || "revised-resume")}.docx"`
    }
  });
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
