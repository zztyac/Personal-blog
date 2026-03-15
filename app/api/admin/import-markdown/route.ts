import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hasAdminSessionValue } from "@/lib/auth/admin";
import { importMarkdownPost } from "@/lib/content/repository";
import { persistUploadedFile, rewriteMarkdownLocalImages } from "@/lib/uploads";

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "name" in value &&
      "size" in value &&
      "text" in value &&
      typeof value.text === "function"
  );
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionValue = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!hasAdminSessionValue(sessionValue)) {
    return NextResponse.json(
      {
        ok: false,
        error: "未登录或登录已失效，请重新登录。"
      },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const markdownText = String(formData.get("markdownText") || "").trim();
    const markdownFile = formData.get("markdownFile");
    const markdownAssets = formData.getAll("markdownAssets").filter(isUploadFile);
    const fallbackTopicSlug = String(formData.get("fallbackTopicSlug") || "frontend-systems").trim();
    const coverImageFile = formData.get("coverImageFile");
    const coverImageUrl = String(formData.get("coverImageUrl") || "").trim();

    let source = markdownText;

    if (!source && isUploadFile(markdownFile) && markdownFile.size > 0) {
      source = await markdownFile.text();
    }

    if (!source) {
      return NextResponse.json(
        {
          ok: false,
          error: "请提供 Markdown 文本或上传 .md 文件。"
        },
        { status: 400 }
      );
    }

    const rewrittenMarkdown = await rewriteMarkdownLocalImages(source, markdownAssets);
    const importedCoverImage =
      isUploadFile(coverImageFile) && coverImageFile.size > 0
        ? await persistUploadedFile(coverImageFile, "post-covers")
        : coverImageUrl || undefined;

    const slug = await importMarkdownPost(rewrittenMarkdown, fallbackTopicSlug, importedCoverImage);

    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/admin");
    revalidatePath("/admin/posts");

    return NextResponse.json({
      ok: true,
      redirectTo: `/admin/posts/${encodeURIComponent(slug)}/edit?imported=1`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Markdown 导入失败，请检查文件格式。";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}
