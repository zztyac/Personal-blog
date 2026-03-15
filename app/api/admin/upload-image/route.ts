import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hasAdminSessionValue } from "@/lib/auth/admin";
import { persistUploadedFile } from "@/lib/uploads";

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "name" in value &&
      "size" in value &&
      "arrayBuffer" in value &&
      typeof value.arrayBuffer === "function"
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
    return NextResponse.json({ ok: false, error: "未登录或登录已失效，请重新登录。" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const folder = String(formData.get("folder") || "misc").trim();
    const file = formData.get("file");

    if (!isUploadFile(file) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "请上传图片文件。" }, { status: 400 });
    }

    if (!String(file.type || "").startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "仅支持图片类型上传。" }, { status: 400 });
    }

    const url = await persistUploadedFile(file, folder);

    return NextResponse.json({
      ok: true,
      url
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "图片上传失败。"
      },
      { status: 500 }
    );
  }
}
