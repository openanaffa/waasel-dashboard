import Link from 'next/link';

export default function Landing() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="max-w-6xl mx-auto flex justify-between items-center p-6">
        <div className="font-bold text-xl">Bouskoura<span className="text-emerald-400">.</span></div>
        <nav className="flex gap-4">
          <Link href="/login"  className="px-4 py-2 rounded-lg hover:bg-white/10">Log in</Link>
          <Link href="/signup" className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium">Get started</Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h1 className="text-5xl font-bold leading-tight">
          WhatsApp automation, <span className="text-emerald-400">simple</span>.
        </h1>
        <p className="mt-6 text-lg text-neutral-400">
          Connect your number, send messages, track conversations — all from one clean dashboard.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/signup" className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-medium">Start free</Link>
          <Link href="/login"  className="px-6 py-3 rounded-xl border border-white/20">Log in</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-24">
        {[
          ['Connect in seconds', 'Scan a QR code and you’re live.'],
          ['Send & receive',     'Full message history, scoped to you.'],
          ['Media on R2',        'Attachments stored on Cloudflare R2.'],
        ].map(([t, d]) => (
          <div key={t} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold text-lg">{t}</h3>
            <p className="text-neutral-400 mt-2">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
