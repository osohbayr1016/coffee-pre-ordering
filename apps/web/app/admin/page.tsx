export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Metrics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 bg-zinc-900/50 border-white/5">
          <h3 className="text-zinc-400 text-sm font-medium mb-1">Total Shops</h3>
          <p className="text-3xl font-bold">42</p>
        </div>
        <div className="glass-panel p-6 bg-zinc-900/50 border-white/5 border-l-4 border-l-amber-500">
          <h3 className="text-zinc-400 text-sm font-medium mb-1">Active Subscriptions</h3>
          <p className="text-3xl font-bold">38</p>
        </div>
        <div className="glass-panel p-6 bg-zinc-900/50 border-white/5">
          <h3 className="text-zinc-400 text-sm font-medium mb-1">Total Orders (Today)</h3>
          <p className="text-3xl font-bold">1,248</p>
        </div>
        <div className="glass-panel p-6 bg-zinc-900/50 border-white/5">
          <h3 className="text-zinc-400 text-sm font-medium mb-1">Platform Revenue</h3>
          <p className="text-3xl font-bold text-amber-500">₮850k</p>
        </div>
      </div>
    </div>
  );
}
