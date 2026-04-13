import mammoth from "mammoth";

const SUPPORTED_EXTENSIONS = [".docx"];

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "Upload a .docx resume file." }, { status: 400 });
  }

  const fileName = String(file.name || "resume").trim();
  const normalizedName = fileName.toLowerCase();
  const isSupported = SUPPORTED_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));

  if (!isSupported) {
    return Response.json(
      { error: "Only .docx resumes are supported in v1. Paste text manually for anything else." },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value, messages } = await mammoth.extractRawText({
      buffer: Buffer.from(arrayBuffer)
    });

    const parsedText = normalizeExtractedText(value);
    if (!parsedText) {
      return Response.json(
        {
          error: "We could not extract usable text from that .docx file. Paste the resume text manually instead."
        },
        { status: 400 }
      );
    }

    return Response.json({
      ok: true,
      name: fileName.replace(/\.docx$/i, ""),
      parsedText,
      warnings: Array.isArray(messages) ? messages.map((item) => item.message).filter(Boolean) : []
    });
  } catch (error) {
    return Response.json(
      {
        error: `We could not parse that .docx file. ${error?.message || "Try another file or paste the text manually."}`
      },
      { status: 400 }
    );
  }
}

function normalizeExtractedText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
