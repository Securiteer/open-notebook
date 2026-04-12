"use client"

export function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-[#09090B]/80 backdrop-blur-md">
      <div className="w-full flex justify-center px-6 py-4">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
              <span className="text-xs font-bold text-zinc-900">a.</span>
            </div>
            <span className="text-white font-semibold">axel.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Pricing
            </a>
            <a href="#docs" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Documentation
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Login
            </a>
            <a
              href="#"
              className="text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 rounded-md border border-zinc-700 transition-colors"
            >
              Sign up for free
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
