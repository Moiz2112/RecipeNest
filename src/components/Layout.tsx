import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from './Header';
import Hero from '../pages/Hero';
import Loading from './Loading'
import ErrorPage from '../pages/auth/error';

/* Note all components will be wrapped in this component which in turn is rendered by _app.tsx */
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error: signinError } = router.query;

  if (signinError) {
    return <ErrorPage />
  }

  if (router.pathname === '/_error') {
    return <ErrorPage message="Page not found" />
  }

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    if (router.pathname === '/RecipeDetail') {
      signIn('google')
      return;
    }
    if (router.pathname === '/About') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#fffbf2] via-[#fffbf6] to-white relative overflow-hidden">
          {/* Translucent Floating Glass Navbar for Guest */}
          <header className="fixed inset-x-0 top-4 z-header mx-auto max-w-5xl px-4">
            <nav className="flex items-center justify-between px-6 py-3 rounded-2xl glass-nav border border-white/60 shadow-lg" aria-label="Global">
              <div className="flex lg:flex-1">
                <a href="/" className="-m-1.5 p-1.5 flex items-center gap-2 hover:opacity-85 transition">
                  <span className="sr-only">Smart Recipe Generator</span>
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-brand-500 flex items-center justify-center shadow-md">
                    <Image src="/logo.svg" alt="RecipeNest Logo" fill className="p-1 object-contain" />
                  </div>
                  <span className="font-extrabold text-lg text-neutral-800 tracking-tight font-heading">
                    Recipe<span className="text-brand-600">Nest</span>
                  </span>
                </a>
              </div>
              <div className="flex gap-x-6">
                <a
                  href="/"
                  className="text-sm font-semibold leading-6 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition duration-200"
                >
                  Home
                </a>
                <a
                  href="/About"
                  className="text-sm font-semibold leading-6 text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition duration-200"
                >
                  About
                </a>
              </div>
              <div className="flex lg:flex-1 lg:justify-end">
                <button
                  className="text-sm font-bold leading-6 text-white bg-neutral-900 px-5 py-2.5 rounded-xl shadow-md hover:bg-neutral-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  onClick={() => signIn('google')}
                >
                  Log in with Google
                </button>
              </div>
            </nav>
          </header>
          <main className="pt-24">{children}</main>
        </div>
      );
    }
    return <Hero />
  }

  if (session) {
    return (
      <div>
        <Header user={session.user} />
        <main className="min-h-screen bg-brand-50">{children}</main>
      </div>
    );
  }

  return <Loading />
};

export default Layout;
