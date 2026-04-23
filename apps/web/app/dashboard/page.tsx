export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 border-l-4 border-coffee-light">
          <h3 className="text-white/60 text-sm font-medium mb-1">Today's Revenue</h3>
          <p className="text-3xl font-bold">₮32,500</p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-blue-500">
          <h3 className="text-white/60 text-sm font-medium mb-1">Completed Orders</h3>
          <p className="text-3xl font-bold">14</p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-green-500">
          <h3 className="text-white/60 text-sm font-medium mb-1">Shop Status</h3>
          <p className="text-2xl font-bold text-green-400">Open</p>
        </div>
      </div>
    </div>
  );
}
