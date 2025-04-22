
import { useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../ui/glass-card";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-insight-dark">
      {/* Sidebar */}
      <aside
        className={`glass fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-full flex-col border-r border-white/10">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
            <Link to="/" className={`text-xl font-bold text-gradient ${!isSidebarOpen && "hidden"}`}>
              InsightValidator
            </Link>
            {!isSidebarOpen && <span className="text-xl font-bold text-gradient mx-auto">IV</span>}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-white/10"
            >
              {isSidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                }
                text="Dashboard"
                isCollapsed={!isSidebarOpen}
                href="/dashboard"
                isActive={true}
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                }
                text="Market Research"
                isCollapsed={!isSidebarOpen}
                href="/market-research"
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
                text="Personas"
                isCollapsed={!isSidebarOpen}
                href="/personas"
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
                text="Interviews"
                isCollapsed={!isSidebarOpen}
                href="/interviews"
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                }
                text="Insights"
                isCollapsed={!isSidebarOpen}
                href="/insights"
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                }
                text="Roadmap"
                isCollapsed={!isSidebarOpen}
                href="/roadmap"
              />
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">User Name</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({
  icon,
  text,
  isCollapsed,
  href,
  isActive = false,
}: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? "bg-white/10 text-white" 
          : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        {icon}
      </span>
      {!isCollapsed && <span className="ml-3">{text}</span>}
    </Link>
  );
};

export { DashboardLayout };
