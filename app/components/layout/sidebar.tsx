export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow-md p-6">
      <h2 className="text-xl font-bold mb-8">AI Resume</h2>

      <nav className="space-y-4">
        <a href="/dashboard" className="block hover:text-blue-500">
          📊 Dashboard
        </a>
        <a href="/builder" className="block hover:text-blue-500">
          📄 Builder
        </a>
        <a href="/analyzer" className="block hover:text-blue-500">
          🤖 Analyzer
        </a>
      </nav>
    </div>
  );
}