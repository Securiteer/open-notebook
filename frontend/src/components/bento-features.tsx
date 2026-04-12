"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ChevronRight, Plus, BookOpen, Newspaper, TrendingUp, Wrench, Boxes } from "lucide-react"
import { useRef, useState } from "react"

// 3D Card wrapper with mouse tracking
function Card3D({
  children,
  className,
  glowColor = "rgba(255,255,255,0.1)",
  style,
}: {
  children: React.ReactNode
  className?: string
  glowColor?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 })
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={className}
    >
      {/* Dynamic glow effect */}
      <motion.div
        className="absolute -inset-px rounded-[30px] opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {/* Glassmorphism inner glow */}
      <div
        className="absolute inset-0 rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${glowColor} 0%, transparent 50%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

// Enhanced 3D Floating Books
function LearningIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-400/5 to-transparent" />
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          width: "200px",
          height: "200px",
        }}
      >
        {/* 3D Floating Book Stack */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, rotateX: 30 }}
            animate={{
              opacity: 0.9 - i * 0.15,
              y: 0,
              rotateX: -20,
              rotateY: 30,
              rotateZ: -5,
            }}
            whileInView={{
              y: [0, -8 - i * 2, 0],
            }}
            transition={{
              delay: i * 0.12,
              duration: 0.8,
              ease: "easeOut",
              y: {
                delay: i * 0.12 + 0.8,
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              width: "100px",
              height: "130px",
              transformStyle: "preserve-3d",
              transform: `translate(-50%, -50%) translateZ(${i * -30}px) translateX(${i * 12}px) translateY(${i * 10}px)`,
            }}
          >
            {/* Book front face with depth */}
            <div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/10 backdrop-blur-sm"
              style={{
                transform: "translateZ(12px)",
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              {/* Book content lines */}
              <div className="p-5 space-y-3">
                <motion.div
                  className="h-2.5 w-20 bg-blue-300/40 rounded-full"
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
                <div className="h-2 w-16 bg-blue-400/25 rounded-full" />
                <div className="h-2 w-24 bg-blue-400/20 rounded-full" />
                <div className="h-2 w-14 bg-blue-400/15 rounded-full" />
              </div>
            </div>
            {/* Book spine - 3D edge */}
            <div
              className="absolute left-0 top-0 h-full w-5 rounded-l-xl bg-gradient-to-r from-blue-600/50 to-blue-500/30"
              style={{
                transform: "rotateY(-90deg) translateZ(-2px)",
                boxShadow: "inset -2px 0 8px rgba(0,0,0,0.3)"
              }}
            />
            {/* Book pages edge */}
            <div
              className="absolute right-0 top-1 bottom-1 w-3 rounded-r bg-gradient-to-l from-blue-200/20 to-blue-100/10"
              style={{ transform: "translateZ(6px)" }}
            />
          </motion.div>
        ))}

        {/* Floating knowledge particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              y: [-10, -80],
              x: [(i % 2 === 0 ? 1 : -1) * (10 + i * 5), (i % 2 === 0 ? -1 : 1) * 20],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.3,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeOut"
            }}
            style={{
              left: `${25 + i * 8}%`,
              top: "70%",
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Enhanced 3D News Cards with holographic effect
function NewsIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-teal-500/10" />
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          width: "220px",
          height: "180px",
        }}
      >
        {/* 3D News Cards with holographic borders */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -80, rotateY: -45 }}
            animate={{
              opacity: 0.95 - i * 0.2,
              x: 0,
              rotateY: -25,
              rotateX: 8,
            }}
            whileInView={{
              x: [0, 5, 0],
              rotateZ: [0, 1, 0],
            }}
            transition={{
              delay: i * 0.15,
              duration: 0.7,
              ease: "easeOut",
              x: {
                delay: i * 0.15 + 0.7,
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              width: "160px",
              height: "90px",
              transformStyle: "preserve-3d",
              transform: `translate(-50%, -50%) translateZ(${i * -40}px) translateY(${i * 25}px) translateX(${i * -8}px)`,
            }}
          >
            {/* Holographic border glow */}
            <motion.div
              className="absolute -inset-0.5 rounded-2xl opacity-60"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.6), rgba(20,184,166,0.4), rgba(34,211,238,0.6))",
                backgroundSize: "200% 200%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <div
              className="absolute inset-0 rounded-2xl bg-zinc-900/90 backdrop-blur-md"
              style={{
                boxShadow: "0 20px 50px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-cyan-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: "0 0 12px rgba(34, 211, 238, 0.8)" }}
                  />
                  <span className="text-cyan-400/70 text-xs font-medium tracking-wide">LIVE</span>
                  <div className="h-1.5 w-16 bg-cyan-400/30 rounded-full ml-2" />
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-gradient-to-r from-cyan-400/30 to-transparent rounded-full" />
                  <div className="h-2 w-4/5 bg-cyan-400/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Data stream lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`stream-${i}`}
            className="absolute h-px"
            style={{
              width: "150px",
              background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.7), rgba(34,211,238,0.7), transparent)",
              top: `${15 + i * 20}%`,
              left: "-30%",
              boxShadow: "0 0 8px rgba(34,211,238,0.5)",
            }}
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 350, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Enhanced 3D Trading Chart with candlesticks
function TradingIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-green-500/10" />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative w-56 h-36"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 3D Chart Platform */}
        <motion.div
          initial={{ opacity: 0, rotateX: 80 }}
          animate={{ opacity: 1, rotateX: 60, rotateZ: -8 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "bottom center",
          }}
        >
          {/* Glowing base */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(16,185,129,0.05) 100%)",
              border: "1px solid rgba(52,211,153,0.2)",
              boxShadow: "0 0 60px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          />

          {/* Grid lines with depth */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-px"
              style={{
                top: `${15 + i * 15}%`,
                background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.15), transparent)",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
            />
          ))}

          {/* 3D Candlesticks */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 h-24">
            {[
              { h: 45, bull: true },
              { h: 70, bull: true },
              { h: 55, bull: false },
              { h: 85, bull: true },
              { h: 60, bull: false },
              { h: 95, bull: true },
              { h: 75, bull: true },
              { h: 90, bull: true },
            ].map((candle, i) => (
              <motion.div
                key={i}
                className="flex-1 relative"
                initial={{ height: 0 }}
                animate={{ height: `${candle.h}%` }}
                transition={{
                  delay: 0.6 + i * 0.08,
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                {/* Candlestick body */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-sm"
                  style={{
                    height: "70%",
                    background: candle.bull
                      ? "linear-gradient(to top, rgba(52,211,153,0.9), rgba(110,231,183,0.7))"
                      : "linear-gradient(to top, rgba(239,68,68,0.9), rgba(252,165,165,0.7))",
                    boxShadow: candle.bull
                      ? "0 0 15px rgba(52,211,153,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
                      : "0 0 15px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                  whileHover={{ scale: 1.1 }}
                />
                {/* Wick */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-px h-full"
                  style={{
                    background: candle.bull ? "rgba(52,211,153,0.6)" : "rgba(239,68,68,0.6)"
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Animated trend line */}
          <motion.svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: "translateZ(5px)" }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(52,211,153,0.3)" />
                <stop offset="50%" stopColor="rgba(52,211,153,1)" />
                <stop offset="100%" stopColor="rgba(110,231,183,0.8)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M 15 80 Q 50 70 80 55 T 140 35 T 200 18"
              fill="none"
              stroke="url(#trendGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.div>

        {/* Floating profit indicator */}
        <motion.div
          className="absolute -top-2 right-0 px-3 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.3), rgba(16,185,129,0.2))",
            border: "1px solid rgba(52,211,153,0.4)",
            boxShadow: "0 0 25px rgba(52,211,153,0.3)",
          }}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.4 }}
        >
          <motion.span
            className="text-emerald-400 text-sm font-bold"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            +24.5%
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}

// Enhanced 3D Tool Builder with assembly animation
function ToolsIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-amber-500/10" />
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="relative"
        style={{
          perspective: "800px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 3D Floating Tool Cubes */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          style={{ transform: "rotateX(20deg) rotateY(-15deg)" }}
        >
          {[
            { delay: 0, icon: true },
            { delay: 0.1, icon: false },
            { delay: 0.2, icon: false },
            { delay: 0.3, icon: false },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5, rotateY: -45 }}
              animate={{
                opacity: 0.9,
                scale: 1,
                rotateY: 0,
              }}
              whileInView={{
                y: [0, -8, 0],
                rotateZ: [0, i % 2 === 0 ? 3 : -3, 0],
              }}
              transition={{
                delay: item.delay,
                duration: 0.5,
                ease: "backOut",
                y: {
                  delay: item.delay + 0.5,
                  duration: 2.5 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="relative"
              style={{
                width: "60px",
                height: "60px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Cube front face */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  transform: "translateZ(15px)",
                  background: "linear-gradient(135deg, rgba(249,115,22,0.4), rgba(245,158,11,0.2))",
                  border: "1px solid rgba(249,115,22,0.5)",
                  boxShadow: "0 0 30px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
                whileHover={{ scale: 1.1 }}
              >
                {item.icon && (
                  <Wrench className="w-7 h-7 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </motion.div>
              {/* Cube right face */}
              <div
                className="absolute top-0 right-0 h-full w-4 rounded-r-xl"
                style={{
                  transform: "rotateY(90deg) translateZ(30px)",
                  background: "linear-gradient(to left, rgba(249,115,22,0.5), rgba(245,158,11,0.3))",
                }}
              />
              {/* Cube top face */}
              <div
                className="absolute top-0 left-0 w-full h-4 rounded-t-xl"
                style={{
                  transform: "rotateX(90deg) translateZ(-8px)",
                  background: "linear-gradient(to bottom, rgba(251,191,36,0.4), rgba(249,115,22,0.2))",
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting beam effects */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "translateZ(-10px)" }}>
          <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(249,115,22,0)" />
              <stop offset="50%" stopColor="rgba(249,115,22,0.6)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0)" />
            </linearGradient>
          </defs>
          <motion.line
            x1="25%" y1="40%" x2="75%" y2="40%"
            stroke="url(#beamGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ delay: 0.6, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.line
            x1="25%" y1="60%" x2="75%" y2="60%"
            stroke="url(#beamGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          />
        </svg>
      </div>
    </div>
  )
}

// Enhanced 3D Agent Hub with orbital system
function EcosystemIllustration() {
  return (
  <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-transparent to-purple-500/10" />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(192,38,211,0.2) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Central hub - glowing core */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="relative w-20 h-20 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(192,38,211,0.5), rgba(168,85,247,0.3))",
            border: "1px solid rgba(192,38,211,0.6)",
            boxShadow: "0 0 60px rgba(192,38,211,0.4), 0 0 100px rgba(192,38,211,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
            transform: "translateZ(40px)",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent)",
            }}
          />
          <Boxes className="w-10 h-10 text-fuchsia-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          {/* Pulsing rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-3xl border border-fuchsia-400/30"
              animate={{
                scale: [1, 1.5 + i * 0.3, 1.8 + i * 0.3],
                opacity: [0.6, 0.2, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>

        {/* Orbital nodes */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * 60 - 30) * (Math.PI / 180)
          const radius = 85
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius * 0.6 // Elliptical orbit

          return (
            <motion.div
              key={i}
              className="absolute w-10 h-10 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(192,38,211,0.35), rgba(168,85,247,0.2))",
                border: "1px solid rgba(192,38,211,0.4)",
                boxShadow: "0 0 25px rgba(192,38,211,0.25)",
                left: "50%",
                top: "50%",
                marginLeft: "-20px",
                marginTop: "-20px",
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 0.8,
                scale: 1,
                x: [x, x + Math.sin(Date.now() / 1000 + i) * 8, x],
                y: [y, y + Math.cos(Date.now() / 1000 + i) * 8, y],
              }}
              transition={{
                delay: 0.4 + i * 0.1,
                duration: 0.5,
                ease: "backOut",
                x: { delay: 0.9 + i * 0.1, duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
                y: { delay: 0.9 + i * 0.1, duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-1 rounded-xl bg-gradient-to-br from-fuchsia-400/20 to-transparent"
              />
            </motion.div>
          )
        })}

        {/* Connection beams to center */}
        <svg className="absolute w-[200px] h-[200px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: "translate(-50%, -50%) translateZ(-5px)" }}>
          <defs>
            <linearGradient id="orbitalBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(192,38,211,0.6)" />
              <stop offset="100%" stopColor="rgba(192,38,211,0)" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * 60 - 30) * (Math.PI / 180)
            const x2 = 100 + Math.cos(angle) * 45
            const y2 = 100 + Math.sin(angle) * 45 * 0.6

            return (
              <motion.line
                key={i}
                x1="100" y1="100"
                x2={x2} y2={y2}
                stroke="url(#orbitalBeam)"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

const featureCards = [
  {
    title: "Learning that adapts to you",
    icon: BookOpen,
    color: "text-blue-400",
    glowColor: "rgba(59,130,246,0.15)",
    bgGradient: "rgba(30, 58, 82, 0.6)",
    topGlow: "rgba(45, 80, 110, 0.5)",
    illustration: <LearningIllustration />,
  },
  {
    title: "Real-time news intelligence",
    icon: Newspaper,
    color: "text-cyan-400",
    glowColor: "rgba(34,211,238,0.15)",
    bgGradient: "rgba(20, 60, 65, 0.6)",
    topGlow: "rgba(30, 85, 90, 0.5)",
    illustration: <NewsIllustration />,
  },
  {
    title: "Automated trading strategies",
    icon: TrendingUp,
    color: "text-emerald-400",
    glowColor: "rgba(52,211,153,0.15)",
    bgGradient: "rgba(20, 55, 45, 0.6)",
    topGlow: "rgba(30, 80, 65, 0.5)",
    illustration: <TradingIllustration />,
  },
  {
    title: "Build your own tools",
    icon: Wrench,
    color: "text-orange-400",
    glowColor: "rgba(249,115,22,0.15)",
    illustration: <ToolsIllustration />,
  },
  {
    title: "Expanding agent ecosystem",
    icon: Boxes,
    color: "text-fuchsia-400",
    glowColor: "rgba(192,38,211,0.15)",
    illustration: <EcosystemIllustration />,
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="relative z-20 py-40" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white max-w-md"
              style={{
                letterSpacing: "-0.0325em",
                fontVariationSettings: '"opsz" 28',
                fontWeight: 538,
                lineHeight: 1.1,
              }}
            >
              Powerful agents for every task
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md"
            >
              <p className="text-zinc-400 leading-relaxed">
                Deploy specialized AI agents that learn, trade, code, and keep you informed. One platform, unlimited possibilities.{" "}
                <a href="#" className="text-white inline-flex items-center gap-1 hover:underline">
                  Explore all agents <ChevronRight className="w-4 h-4" />
                </a>
              </p>
            </motion.div>
          </div>

          {/* Feature cards - Enhanced Bento grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ perspective: "2000px" }}
          >
            {/* First row - 3 cards */}
            {featureCards.slice(0, 3).map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              >
                <Card3D
                  glowColor={card.glowColor}
                  className="border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-500 cursor-pointer group overflow-hidden relative flex flex-col justify-end"
                  style={{
                    aspectRatio: "336 / 360",
                    borderRadius: "30px",
                    height: "360px",
                    isolation: "isolate",
                    background: `linear-gradient(160deg, ${card.bgGradient || 'rgba(30, 41, 59, 0.5)'} 0%, rgba(9, 9, 11, 0.95) 50%, rgba(9, 9, 11, 1) 100%)`,
                  }}
                >
                  {/* Subtle inner glow at top */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${card.topGlow || 'rgba(30, 58, 77, 0.4)'} 0%, transparent 60%)`,
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                    style={{
                      maskImage: "linear-gradient(#000 55%, transparent 90%)",
                      WebkitMaskImage: "linear-gradient(#000 55%, transparent 90%)",
                    }}
                  >
                    {card.illustration}
                  </div>
                  <div
                    className="relative z-10 flex items-center justify-between w-full"
                    style={{ padding: "0 24px 32px", gap: "16px" }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </motion.div>
                      <h3 className="text-white font-medium text-lg leading-tight">{card.title}</h3>
                    </div>
                    <motion.div
                      className="w-8 h-8 rounded-full border border-zinc-700/80 flex items-center justify-center text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300 transition-all duration-300 flex-shrink-0"
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.div>
                  </div>
                </Card3D>
              </motion.div>
            ))}

            {/* Second row - 2 wider cards */}
            {featureCards.slice(3, 5).map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                className={index === 0 ? "md:col-span-1" : "md:col-span-2"}
              >
                <Card3D
                  glowColor={card.glowColor}
                  className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-600/80 transition-all duration-500 cursor-pointer group overflow-hidden relative flex flex-col justify-end backdrop-blur-sm h-full"
                  style={{
                    borderRadius: "30px",
                    height: "280px",
                    isolation: "isolate",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                    style={{
                      maskImage: "linear-gradient(#000 60%, transparent 95%)",
                      WebkitMaskImage: "linear-gradient(#000 60%, transparent 95%)",
                    }}
                  >
                    {card.illustration}
                  </div>
                  <div
                    className="relative z-10 flex items-center justify-between w-full"
                    style={{ padding: "0 24px 32px", gap: "16px" }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </motion.div>
                      <h3 className="text-white font-medium text-lg leading-tight">{card.title}</h3>
                    </div>
                    <motion.div
                      className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-zinc-400 group-hover:text-zinc-200 transition-all duration-300 flex-shrink-0 group-hover:bg-zinc-800/50"
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
