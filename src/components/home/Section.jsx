/** Wrapper section homepage: jarak, lebar konten, dan judul yang seragam. */
export default function Section({ id, eyebrow, title, description, className = '', children }) {
  return (
    <section id={id} className={`scroll-mt-16 py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(eyebrow || title) && (
          <div className="mb-12 max-w-2xl">
            {eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-accent">{eyebrow}</p>}
            {title && <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>}
            {description && <p className="mt-4 text-muted">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}