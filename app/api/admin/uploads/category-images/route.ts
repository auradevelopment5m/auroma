import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/support/server-auth"

const BUCKET = "category-images"
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB per image

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

async function ensureBucket(admin: Awaited<ReturnType<typeof requireAdmin>>["admin"]) {
  // Creating an existing bucket throws; we can safely ignore.
  try {
    const { data } = await admin.storage.getBucket(BUCKET)
    if (data) return
  } catch {
    // ignore
  }

  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  })

  // If it already exists, Supabase usually returns a 409-ish error. Ignore that.
  if (error && !/exists|duplicate|409/i.test(error.message)) {
    throw new Error(error.message)
  }
}

export async function POST(req: Request) {
  try {
    const { admin } = await requireAdmin()

    const form = await req.formData()

    const filesFromFiles = form.getAll("files").filter((v): v is File => v instanceof File)
    const fileFromFile = form.get("file")
    const files = filesFromFiles.length ? filesFromFiles : fileFromFile instanceof File ? [fileFromFile] : []

    if (files.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 })
    }

    const categoryId = String(form.get("categoryId") ?? "").trim() || null
    const slug = String(form.get("slug") ?? "").trim() || null

    await ensureBucket(admin)

    const urls: string[] = []
    const paths: string[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 413 })
      }
      if (file.type && !file.type.startsWith("image/")) {
        return NextResponse.json({ error: `Unsupported file type: ${file.type || file.name}` }, { status: 400 })
      }

      const safeName = safeFileName(file.name || "image")
      const folder = categoryId ?? slug ?? "misc"
      const objectPath = `categories/${folder}/${crypto.randomUUID()}-${safeName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await admin.storage.from(BUCKET).upload(objectPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(objectPath)

      urls.push(publicUrlData.publicUrl)
      paths.push(objectPath)
    }

    return NextResponse.json({ ok: true, bucket: BUCKET, urls, paths })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
