'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { 
  Menu, 
  X, 
  User, 
  Building2, 
  LogOut, 
  ChevronDown,
  Briefcase,
  Heart,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui';

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const getDashboardLink = () => {
    if (!session?.user) return '/login';
    switch (session.user.role) {
      case 'CANDIDATE':
        return '/candidato';
      case 'COMPANY':
        return '/empresa';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Empregos <span className="text-blue-600">RMC</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/vagas" className="text-gray-600 hover:text-gray-900 font-medium">
              Vagas
            </Link>
            <Link href="/empresas" className="text-gray-600 hover:text-gray-900 font-medium">
              Empresas
            </Link>
            <Link href="/sobre" className="text-gray-600 hover:text-gray-900 font-medium">
              Sobre
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {session?.user?.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    {session?.user?.role === 'CANDIDATE' && (
                      <>
                        <Link
                          href="/candidato/candidaturas"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Minhas Candidaturas
                        </Link>
                        <Link
                          href="/candidato/favoritos"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Favoritos
                        </Link>
                      </>
                    )}
                    <Link
                      href={`${getDashboardLink()}/configuracoes`}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/cadastro">
                  <Button>Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              <Link
                href="/vagas"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vagas
              </Link>
              <Link
                href="/empresas"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Empresas
              </Link>
              <Link
                href="/sobre"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>
              <hr className="my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    className="block px-4 py-2 text-blue-600 font-medium hover:bg-gray-100 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
