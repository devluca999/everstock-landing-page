/**
 * The page as plain HTML, rendered on the server. The designs render on the client only
 * (their logic reads window while rendering), so without this a crawler that does not run
 * JavaScript sees an empty page. The text comes from the design itself: scripts/port-dc.mjs
 * writes it to generated/seo.json from the sections a visitor sees, so it stays in step with
 * every port.
 *
 * It is visually hidden (crawlers and screen readers still read it) and the client component
 * replaces it with the design once it mounts. Without JavaScript it is shown as a simple page.
 */
type Block = { h: number; text: string } | { p: string } | { a: string; href: string };
export type SeoSection = { id: string; footer?: boolean; blocks: Block[] };

const NO_JS_CSS = `.es-seo{position:static!important;width:auto!important;height:auto!important;clip:auto!important;overflow:visible!important;white-space:normal!important;max-width:68ch;margin:0 auto;padding:32px 20px;font-family:system-ui,sans-serif;line-height:1.5;color:#16171b;background:#f4f1ea}.es-seo section,.es-seo footer{margin-bottom:28px}.es-seo ul{display:flex;flex-wrap:wrap;gap:8px 18px;padding:0;list-style:none}`;

function renderBlocks(blocks: Block[]) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if ("a" in b) {
      // a run of links is a list of links
      const links: { a: string; href: string }[] = [];
      while (i < blocks.length && "a" in blocks[i]) links.push(blocks[i++] as { a: string; href: string });
      i--;
      out.push(
        <ul key={i}>
          {links.map((l) => (
            <li key={l.href + l.a}>
              <a href={l.href}>{l.a}</a>
            </li>
          ))}
        </ul>
      );
    } else if ("h" in b) {
      const H = (["h1", "h2", "h3", "h4"] as const)[Math.min(4, Math.max(1, b.h)) - 1];
      out.push(<H key={i}>{b.text}</H>);
    } else {
      out.push(<p key={i}>{b.p}</p>);
    }
  }
  return out;
}

export default function SeoFallback({ sections }: { sections: SeoSection[] }) {
  const body = sections.filter((s) => !s.footer);
  const foot = sections.filter((s) => s.footer);
  return (
    <div
      className="es-seo"
      style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
    >
      <noscript>
        <style>{NO_JS_CSS}</style>
      </noscript>
      <main>
        {body.map((s) => (
          <section key={s.id} id={s.id}>
            {renderBlocks(s.blocks)}
          </section>
        ))}
      </main>
      {foot.map((s) => (
        <footer key={s.id} id={s.id}>
          {renderBlocks(s.blocks)}
        </footer>
      ))}
    </div>
  );
}
