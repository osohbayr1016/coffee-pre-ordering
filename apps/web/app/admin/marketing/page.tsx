export default function MarketingPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketing & Promos</h1>
          <p className="text-zinc-400 text-sm">Manage promo codes and referrals</p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white">
          + New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 bg-zinc-900/50 border-white/5">
          <h2 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">Active Promo Codes</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10 border-l-4 border-l-green-500">
              <div>
                <span className="font-mono text-amber-400 font-bold tracking-widest">FIRSTCOFFEE50</span>
                <p className="text-xs text-zinc-400 mt-1">50% off first order</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">342 uses</span>
                <p className="text-xs text-zinc-500 mt-1">Ends in 5 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 bg-zinc-900/50 border-white/5">
          <h2 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">Referral Program Stats</h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold text-amber-500">128</p>
              <p className="text-sm text-zinc-400 mt-1">New users referred</p>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div>
              <p className="text-3xl font-bold">₮320k</p>
              <p className="text-sm text-zinc-400 mt-1">Discounts awarded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
