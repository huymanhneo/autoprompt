import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Settings, Film } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-white">YouTube Auto</h1>
              <p className="text-xs text-slate-400">Video Content Creator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/')
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Trang chủ</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/settings')
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Cài đặt</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 text-center">
            <p>YouTube Video Automation</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
