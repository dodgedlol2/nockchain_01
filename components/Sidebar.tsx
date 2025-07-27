'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"/>
        </svg>
      )
    },
    {
      name: 'Hashrate',
      href: '/hashrate',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
        </svg>
      )
    },
    {
      name: 'Mining',
      href: '/mining',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.27,4.73L19.27,9.73C19.65,10.11 19.65,10.74 19.27,11.12L14.27,16.12C13.89,16.5 13.26,16.5 12.88,16.12C12.5,15.74 12.5,15.11 12.88,14.73L16.16,11.45H8.91L12.19,14.73C12.57,15.11 12.57,15.74 12.19,16.12C11.81,16.5 11.18,16.5 10.8,16.12L5.8,11.12C5.42,10.74 5.42,10.11 5.8,9.73L10.8,4.73C11.18,4.35 11.81,4.35 12.19,4.73C12.57,5.11 12.57,5.74 12.19,6.12L8.91,9.4H16.16L12.88,6.12C12.5,5.74 12.5,5.11 12.88,4.73C13.26,4.35 13.89,4.35 14.27,4.73Z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="w-64 bg-[#0F0F1A] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#5B6CFF] to-[#7C3AED] bg-clip-text text-transparent">
          NockChain
        </h1>
        <p className="text-sm text-gray-400 mt-1">Analytics</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#5B6CFF] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Powered by NockBlocks API
        </p>
      </div>
    </div>
  )
}
