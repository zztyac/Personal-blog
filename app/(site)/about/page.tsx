export const metadata = {
  title: "关于"
};

export default function AboutPage() {
  return (
    <div className="shell">
      <section className="archive-banner">
        <div className="archive-banner__panel stack">
          <span className="hero__eyebrow">About</span>
          <h1 className="section-title__heading">关于这个博客</h1>
          <p className="section-copy">
            Neon District 是一个面向个人长期运营的技术博客模板，目标不是做通用内容站，而是做一个有强烈视觉识别、
            能稳定写作和分享的个人阵地。
          </p>
          <div className="pill-list">
            <span className="pill">SSR / ISR Ready</span>
            <span className="pill">Markdown Import</span>
            <span className="pill">Admin Authoring</span>
          </div>
        </div>
      </section>
    </div>
  );
}
