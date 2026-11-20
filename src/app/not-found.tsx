import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="prose">
      <h1>Page not found</h1>
      <p>There is nothing at this address. It may have moved, or the link may be mistyped.</p>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/work/">All projects</Link>
        </li>
        <li>
          <Link href="/contact/">Contact</Link>
        </li>
      </ul>
    </div>
  );
}
