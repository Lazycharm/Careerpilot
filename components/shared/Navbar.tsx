'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, MessageSquare, Target, Settings, LogOut, User, Menu, X, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-navbar]') && !target.closest('[data-user-menu]')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session) return null

  const isAdmin = session.user?.role === 'admin'
  const userName = session.user?.name || 'User'
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: null, pathMatch: (p: string) => p === '/dashboard' },
    { href: '/resume', label: 'Resume', icon: FileText, pathMatch: (p: string) => p?.startsWith('/resume') },
    { href: '/cover-letter', label: 'Cover Letter', icon: MessageSquare, pathMatch: (p: string) => p?.startsWith('/cover-letter') },
    { href: '/interview', label: 'Interview', icon: Target, pathMatch: (p: string) => p?.startsWith('/interview') },
  ]

  if (isAdmin) {
    navLinks.push({
      href: '/admin',
      label: 'Admin',
      icon: Settings,
      pathMatch: (p: string) => p?.startsWith('/admin'),
    })
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm" data-navbar>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Career Pilot" 
              width={120} 
              height={40}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = link.pathMatch(pathname || '')
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="h-9 px-3 lg:px-4 text-sm"
                  >
                    {Icon && <Icon className="h-4 w-4 mr-1.5 lg:mr-2" />}
                    <span className="hidden lg:inline">{link.label}</span>
                    <span className="lg:hidden">{link.label.split(' ')[0]}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Desktop User Menu */}
            <div className="hidden md:block relative" data-user-menu>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 lg:px-3"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                    {userInitials}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate">{userName}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              </Button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link href="/profile">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = link.pathMatch(pathname || '')
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start h-10 px-4"
                    >
                      {Icon && <Icon className="h-4 w-4 mr-3" />}
                      {link.label}
                    </Button>
                  </Link>
                )
              })}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-10 px-4"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full justify-start h-10 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

