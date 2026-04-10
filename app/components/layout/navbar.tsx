export default function Navbar() {
  return (
    <div className="flex justify-between items-center bg-white px-6 py-4 shadow">
      <h1 className="font-semibold text-lg">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm">User</span>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}