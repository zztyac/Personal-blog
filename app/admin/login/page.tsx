import { loginAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "管理员登录"
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <div className="login-shell">
      <div className="login-panel stack">
        <span className="admin-caption">Secure Entry</span>
        <h1 className="admin-heading">管理员登录</h1>
        <p className="admin-copy">普通访客无法进入后台。只有输入管理员密码后，才会写入后台会话 Cookie 并进入管理系统。</p>
        {params.error ? <p className="admin-copy" style={{ color: "#ff8fcb" }}>密码错误，请重试。</p> : null}
        <form action={loginAction} className="stack">
          <div className="field">
            <label htmlFor="password">管理员密码</label>
            <input id="password" name="password" type="password" placeholder="请输入管理员密码" />
          </div>
          <button type="submit" className="button-primary">
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
