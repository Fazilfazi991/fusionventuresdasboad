export function PlaceholderPage({ title }) {
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">{title}</h1>
      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-lg font-medium text-zinc-900">{title}</p>
      </div>
    </section>
  );
}
