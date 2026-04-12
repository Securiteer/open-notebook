'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight, Loader2, Code2, TrendingUp, BookOpen } from 'lucide-react'

interface BetaPlaceholderProps {
  id: string;
  name: string;
  description: string;
  iconType: 'code' | 'trading' | 'notebook';
}

export function BetaPlaceholder({ id, name, description, iconType }: BetaPlaceholderProps) {
  const [hasSignedUp, setHasSignedUp] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSignup = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setHasSignedUp(true)
      setIsAnimating(false)
    }, 1500)
  }

  const Icon = iconType === 'code' ? Code2 : iconType === 'trading' ? TrendingUp : BookOpen
  const iconColor = iconType === 'code' ? 'text-orange-400' : iconType === 'trading' ? 'text-emerald-400' : 'text-blue-400'

  return (
    <div className="flex-1 p-6 h-full w-full bg-zinc-950 text-white flex items-center justify-center rounded-xl border border-zinc-800/50 m-4 shadow-xl overflow-hidden">
      <motion.div
        key={`${id}-beta`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center max-w-md mx-auto text-center"
      >
        <div className={`w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-6 border border-zinc-700/50 ${iconColor}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-white text-2xl font-semibold mb-3">{name}</h2>
        <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
          {description} This feature is currently in active development. Sign up for our beta program to get early access.
        </p>

        {hasSignedUp ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex flex-col items-center gap-3 w-full"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-medium">
              Thanks for signing up for beta testing access!
            </p>
            <p className="text-xs text-emerald-400/80">
              Your application will be reviewed on an ongoing basis.
            </p>
          </motion.div>
        ) : (
          <button
            onClick={handleSignup}
            disabled={isAnimating}
            className="bg-white text-zinc-950 hover:bg-zinc-200 font-medium px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAnimating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Signing up...</span>
              </>
            ) : (
              <>
                <span>Sign up for beta testing</span>
                <ChevronRight className="w-4 h-4 text-zinc-950" />
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  )
}
