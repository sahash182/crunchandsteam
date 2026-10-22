// Photo credits for representative (stand-in) dish photos. Generated automatically from
// menu-photos/stock/credits.json — disappears per dish once a real photo is added.
import { photoCredits } from '../data/catalog'

export default function Credits() {
  return (
    <main className="min-h-screen bg-brand-cream pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif font-bold text-4xl text-brand-text">Photo credits</h1>
        <p className="mt-3 text-brand-text/70">
          Some menu photos are representative images used until we photograph our own dishes.
          They are shared under the licences below. Thank you to the photographers.
        </p>
        {photoCredits.length === 0 ? (
          <p className="mt-8 text-brand-text/70">All menu photos are our own. 🎉</p>
        ) : (
          <ul className="mt-8 space-y-3">
            {photoCredits.map(c => (
              <li key={c.dish} className="bg-white rounded-xl p-4 text-sm border border-brand-dark/5">
                <p className="font-semibold text-brand-text">{c.dish}</p>
                <p className="text-brand-text/70">
                  {c.attribution ? (
                    c.attribution
                  ) : (
                    <>“{c.title}” by {c.creator} · {c.license}</>
                  )}
                </p>
                {c.source && (
                  <a href={c.source} target="_blank" rel="noopener noreferrer"
                     className="text-brand-primary hover:underline break-all">
                    Source
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
