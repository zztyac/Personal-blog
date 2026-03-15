type SectionTitleProps = {
  eyebrow: string;
  title: string;
  copy: string;
};

export function SectionTitle({ eyebrow, title, copy }: SectionTitleProps) {
  return (
    <div className="section-title">
      <span className="section-title__eyebrow">{eyebrow}</span>
      <h2 className="section-title__heading">{title}</h2>
      <p className="section-copy">{copy}</p>
    </div>
  );
}
