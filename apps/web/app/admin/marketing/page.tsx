export default function MarketingPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Marketing & Promos</h1>
          <p className="text-zinc-400">Manage promo codes and referral campaigns</p>
        </div>
        <button disabled className="bg-zinc-800 text-zinc-500 px-6 py-2.5 rounded-xl text-sm font-bold shadow-inner cursor-not-allowed border border-white/5">
          + New Campaign
        </button>
      </div>

      <div className="glass-panel p-12 text-center rounded-3xl border border-white/5 bg-gradient-to-b from-zinc-900/60 to-black/80 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(245,158,11,0.1),_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="text-6xl mb-6 drop-shadow-2xl opacity-80 mix-blend-luminosity">🚀</div>
        <h2 className="text-2xl font-black tracking-widest text-white mb-2">PROMOS COMING SOON</h2>
        <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
          The campaign engine is currently being upgraded. Soon you'll be able to launch highly targeted promo codes, automated referral rewards, and seasonal discounts directly from this dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
}
