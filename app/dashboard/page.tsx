
import Sidebar from "../components/layout/sidebar";
import Navbar from "../components/layout/navbar";
import Card from "../components/ui/Card";

export default function Dashboard() {
  return (
    <div className="flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen">
        
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            Welcome back 👋
          </h2>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              title="📄 Create Resume"
              description="Build a new resume with AI"
            />
            <Card
              title="🤖 Analyze Resume"
              description="Get resume score and feedback"
            />
            <Card
              title="🎯 Job Match"
              description="Match resume with job description"
            />
          </div>
        </div>

      </div>
    </div>
  );
}