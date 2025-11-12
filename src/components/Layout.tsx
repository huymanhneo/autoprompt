import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Settings, Film } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  console.log('[Layout] Rendering, location:', location.pathname)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700 bg-gradient-to-br from-slate-800 to-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-md"></div>
              <Film className="relative w-10 h-10 text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                YouTube Auto
              </h1>
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
          <div className="text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-primary-400">●</span>
              <span className="font-medium text-slate-300">v1.0.0 MVP</span>
            </div>
            <div className="text-center leading-relaxed">
              <p className="text-slate-500">Phát triển bởi</p>
              <p className="text-primary-400 font-semibold">Mr.Mạnh</p>
              <a
                href="tel:0979121097"
                className="text-slate-400 hover:text-primary-300 transition-colors"
              >
                0979.121.097
              </a>
            </div>
            <div className="text-center text-slate-600 text-[10px]">
              © 2024 All Rights Reserved
            </div>
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
