"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Newspaper,
  TrendingUp,
  Code2,
  Boxes,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  MoreHorizontal,
  Sparkles,
  Settings,
  HelpCircle,
  Bell,
  Activity,
} from "lucide-react"

export function AgentDashboardMockup() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  }

  const panelVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      y: -80,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      className="w-full h-full bg-zinc-950 flex overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <motion.div
        className="w-[220px] h-full bg-zinc-900/80 border-r border-zinc-800/50 flex flex-col shrink-0"
        variants={panelVariants}
      >
        {/* Logo */}
        <div className="p-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white">
              <span className="text-[10px] font-bold text-zinc-900">a.</span>
            </div>
            <span className="text-white font-semibold text-sm">axel.ai</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-auto" />
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/50 rounded-md text-zinc-500 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search agents...</span>
            <span className="ml-auto text-[10px] bg-zinc-700/50 px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="px-3 space-y-0.5">
          <NavItem icon={Activity} label="Dashboard" active />
          <NavItem icon={Bell} label="Notifications" badge={5} />
        </div>

        {/* Agents section */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Your Agents
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={BookOpen} label="Learning Agent" color="text-blue-400" />
            <NavItem icon={Newspaper} label="News Agent" color="text-cyan-400" />
            <NavItem icon={TrendingUp} label="Trading Agent" color="text-emerald-400" />
            <NavItem icon={Code2} label="Code Agent" color="text-orange-400" />
          </div>
        </div>

        {/* Templates section */}
        <div className="mt-5 px-3 flex-1">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Templates
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Sparkles} label="AI Research" hasSubmenu />
            <NavItem icon={Boxes} label="Automation" hasSubmenu />
          </div>
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-zinc-800/50">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={HelpCircle} label="Help & Support" />
        </div>
      </motion.div>

      {/* Agent List */}
      <motion.div
        className="w-[320px] h-full bg-zinc-900/40 border-r border-zinc-800/50 flex flex-col shrink-0"
        variants={panelVariants}
      >
        <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Active Agents</h3>
          <div className="flex items-center gap-2">
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <AgentItem
            name="Trading Agent"
            status="Running"
            metric="+12.4% today"
            icon={TrendingUp}
            iconColor="text-emerald-400"
            active
          />
          <AgentItem
            name="News Agent"
            status="Running"
            metric="24 updates"
            icon={Newspaper}
            iconColor="text-cyan-400"
          />
          <AgentItem
            name="Code Agent"
            status="Building"
            metric="3 projects"
            icon={Code2}
            iconColor="text-orange-400"
          />
          <AgentItem
            name="Learning Agent"
            status="Learning"
            metric="87% complete"
            icon={BookOpen}
            iconColor="text-blue-400"
          />
          <AgentItem
            name="Research Agent"
            status="Paused"
            metric="15 papers"
            icon={Sparkles}
            iconColor="text-purple-400"
          />
        </div>
      </motion.div>

      {/* Detail Panel */}
      <motion.div className="flex-1 h-full bg-zinc-950 flex flex-col overflow-hidden" variants={panelVariants}>
        {/* Header breadcrumb */}
        <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Agents</span>
            <span className="text-zinc-600">›</span>
            <span className="text-emerald-400">Trading Agent</span>
            <span className="text-zinc-600">›</span>
            <span className="text-zinc-300">Performance</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-auto scrollbar-hide">
          <h2 className="text-white text-xl font-semibold mb-5">Trading Agent Overview</h2>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800/50">
              <div className="text-zinc-500 text-xs mb-1">Total Profit</div>
              <div className="text-emerald-400 text-lg font-semibold">+$12,847</div>
            </div>
            <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800/50">
              <div className="text-zinc-500 text-xs mb-1">Win Rate</div>
              <div className="text-white text-lg font-semibold">73.2%</div>
            </div>
            <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800/50">
              <div className="text-zinc-500 text-xs mb-1">Active Trades</div>
              <div className="text-white text-lg font-semibold">8</div>
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800/50 mb-5">
            <div className="text-zinc-400 text-sm mb-4">Performance Chart</div>
            <div className="h-32 flex items-end gap-1">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-500/60 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">Recent Activity</div>
            <div className="space-y-3">
              <ActivityItem
                action="Executed buy order"
                detail="BTC/USD at $67,234"
                time="2 minutes ago"
                type="success"
              />
              <ActivityItem
                action="Analysis complete"
                detail="Market sentiment: Bullish"
                time="15 minutes ago"
                type="info"
              />
              <ActivityItem
                action="Stop-loss triggered"
                detail="ETH/USD position closed"
                time="1 hour ago"
                type="warning"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
  hasSubmenu,
  color,
}: {
  icon: React.ElementType
  label: string
  badge?: number
  active?: boolean
  hasSubmenu?: boolean
  color?: string
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
    >
      <Icon className={`w-4 h-4 ${color || ""}`} />
      <span className="flex-1 text-xs">{label}</span>
      {badge && (
        <span className="bg-blue-500/80 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
          {badge}
        </span>
      )}
      {hasSubmenu && <ChevronRight className="w-3 h-3 text-zinc-600" />}
    </div>
  )
}

function AgentItem({
  name,
  status,
  metric,
  icon: Icon,
  iconColor,
  active,
}: {
  name: string
  status: string
  metric: string
  icon: React.ElementType
  iconColor: string
  active?: boolean
}) {
  const statusColors: Record<string, string> = {
    Running: "bg-emerald-500",
    Building: "bg-orange-500",
    Learning: "bg-blue-500",
    Paused: "bg-zinc-500",
  }

  return (
    <div
      className={`px-4 py-3 border-b border-zinc-800/30 cursor-pointer transition-colors ${
        active ? "bg-zinc-800/50" : "hover:bg-zinc-800/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white text-xs truncate leading-tight">{name}</p>
            <div className={`w-2 h-2 rounded-full ${statusColors[status] || "bg-zinc-500"}`} />
          </div>
          <p className="text-zinc-500 text-[10px]">{status}</p>
        </div>
        <span className="text-zinc-400 text-[10px] shrink-0">{metric}</span>
      </div>
    </div>
  )
}

function ActivityItem({
  action,
  detail,
  time,
  type,
}: {
  action: string
  detail: string
  time: string
  type: "success" | "info" | "warning"
}) {
  const typeColors = {
    success: "text-emerald-400",
    info: "text-blue-400",
    warning: "text-amber-400",
  }

  return (
    <div className="flex items-start gap-2">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${type === "success" ? "bg-emerald-400" : type === "info" ? "bg-blue-400" : "bg-amber-400"}`} />
      <div className="flex-1">
        <p className="text-zinc-300 text-xs">
          <span className={typeColors[type]}>{action}</span>
          <span className="text-zinc-500"> · {detail}</span>
        </p>
        <p className="text-zinc-600 text-[10px] mt-0.5">{time}</p>
      </div>
    </div>
  )
}
