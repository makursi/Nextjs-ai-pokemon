import { siteDescription, siteName } from "@/lib/site";
import { tools } from "@/tools/registry";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{siteName}</h1>
      <p className="mt-2 text-muted-foreground">{siteDescription}</p>

      {tools.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No tools yet.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <a
                className="block rounded-lg border p-4 hover:border-foreground/20"
                href={`/tools/${tool.slug}`}
              >
                <span className="font-medium">{tool.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{tool.description}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
