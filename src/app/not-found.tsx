import Link from 'next/link';
import type { Metadata } from 'next';
import { sectionIds } from '@/data/sections';
import { MothCharacter } from '@/components/ui/Moth';

export const metadata: Metadata = { title: 'Not found', robots: { index: false } };

// Known section paths (/projects, /about/ …) redirect to their hash; anything else shows this page.
const redirect = `(function(){var p=location.pathname.replace(/^\/+|\/+$/g,'').toLowerCase();var ids=${JSON.stringify(sectionIds)};if(ids.indexOf(p)>-1){location.replace('/#'+p)}})();`;

export default function NotFound() {
  return (
    <main id="main" className="relative z-[2] grid min-h-[100svh] place-items-center px-6 text-center">
      <script dangerouslySetInnerHTML={{ __html: redirect }} />
      <div>
        <div className="flex justify-center">
          <MothCharacter pose="sleep" size={96} />
        </div>
        <p className="mono mt-6 text-[13px] text-accent">404 · no light reaches this page</p>
        <h1 className="display mt-3 text-[44px] text-fg">Nothing here.</h1>
        <p className="mx-auto mt-3 max-w-[420px] text-fg-2">The link may be old or mistyped. Everything lives on one page now.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go home</Link>
          <Link href="/#projects" className="btn">See projects</Link>
        </div>
      </div>
    </main>
  );
}
