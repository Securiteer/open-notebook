"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { useRef, useState } from "react"

// 3D Card wrapper with mouse tracking - matching bento-features style
function PricingCard3D({
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

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"])

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

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI agents",
    icon: Sparkles,
    color: "from-zinc-400 to-zinc-500",
    borderColor: "border-zinc-800/80",
    glowColor: "rgba(161, 161, 170, 0.15)",
    accentColor: "text-zinc-400",
    features: [
      "3 AI agents",
      "1,000 requests/month",
      "Basic learning tools",
      "News aggregation",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals who need more power",
    icon: Zap,
    color: "from-cyan-400 to-blue-500",
    borderColor: "border-cyan-500/30",
    glowColor: "rgba(34, 211, 238, 0.2)",
    accentColor: "text-cyan-400",
    features: [
      "Unlimited AI agents",
      "50,000 requests/month",
      "Advanced learning & trading",
      "Real-time news analysis",
      "Build custom tools",
      "Priority support",
      "API access",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Ultra",
    price: "$99",
    period: "/month",
    description: "For teams and enterprises at scale",
    icon: Crown,
    color: "from-amber-400 to-orange-500",
    borderColor: "border-amber-500/30",
    glowColor: "rgba(251, 191, 36, 0.15)",
    accentColor: "text-amber-400",
    features: [
      "Everything in Pro",
      "Unlimited requests",
      "Custom agent training",
      "White-label solutions",
      "Dedicated infrastructure",
      "24/7 premium support",
      "SLA guarantee",
      "Team collaboration",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-40 overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Ambient background glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top gradient fade */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)",
        }}
      />

      <div className="relative w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Header - matching bento-features layout */}
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
              Simple, transparent pricing
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md"
            >
              <p className="text-zinc-400 leading-relaxed">
                Start free and scale as you grow. No hidden fees, cancel anytime. All plans include SSL encryption and GDPR compliance.
              </p>
            </motion.div>
          </div>

          {/* Pricing cards with 3D perspective - matching bento grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ perspective: "2000px" }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className="relative group"
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + index * 0.1,
                  ease: "easeOut"
                }}
              >
                <PricingCard3D
                  glowColor={plan.glowColor}
                  className="relative h-full bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-600/80 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-sm"
                  style={{
                    borderRadius: "30px",
                    isolation: "isolate",
                  }}
                >
                  {/* Background gradient orb */}
                  <div className="absolute inset-0 overflow-hidden rounded-[30px]">
                    <motion.div
                      className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${plan.color} opacity-10 blur-3xl`}
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>

                  {/* Popular badge */}
                  {plan.popular && (
                    <motion.div
                      className="absolute top-6 right-6 z-20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium text-cyan-300 border border-cyan-500/30"
                        style={{
                          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)",
                          boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)"
                        }}
                      >
                        Most Popular
                      </div>
                    </motion.div>
                  )}

                  {/* Card content */}
                  <div className="relative p-8" style={{ transform: "translateZ(20px)" }}>
                    {/* 3D floating icon */}
                    <motion.div
                      className="mb-6"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                        style={{
                          boxShadow: `0 8px 32px ${plan.glowColor}`,
                        }}
                      >
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>

                    {/* Plan info */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-3">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-semibold text-white" style={{ fontVariationSettings: '"opsz" 28', letterSpacing: "-0.02em" }}>{plan.price}</span>
                        <span className="text-zinc-500 text-sm">{plan.period}</span>
                      </div>
                      <p className="text-zinc-500 text-sm">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-zinc-300"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-zinc-400">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                      className={`relative w-full py-3 px-6 rounded-xl font-medium text-sm overflow-hidden transition-all duration-300 ${
                        plan.popular
                          ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                          : 'bg-zinc-800/80 text-white border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.button>
                  </div>

                  {/* Decorative floating elements */}
                  <div className="absolute bottom-6 right-6 opacity-10 pointer-events-none">
                    <motion.div
                      className={`w-16 h-16 rounded-xl border ${plan.borderColor}`}
                      style={{
                        transform: "rotateX(45deg) rotateZ(45deg)",
                        transformStyle: "preserve-3d"
                      }}
                      animate={{
                        rotateZ: [45, 55, 45],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </PricingCard3D>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
