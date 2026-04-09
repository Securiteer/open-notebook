"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  ThumbsUp,
  ThumbsDown,
  Flag,
  ExternalLink,
  Clock,
} from "lucide-react"

type Agent = {
  id: string
  name: string
  status: "Running" | "Building" | "Learning" | "Paused"
  metric: string
  icon: React.ElementType
  iconColor: string
  description: string
  stats: {
    label: string
    value: string
    change?: string
    positive?: boolean
  }[]
  activities: {
    action: string
    detail: string
    time: string
    type: "success" | "info" | "warning"
  }[]
}

const agents: Agent[] = [
  {
    id: "trading",
    name: "Trading Agent",
    status: "Running",
    metric: "+12.4% today",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    description: "Automated trading strategies powered by real-time market analysis and ML predictions.",
    stats: [
      { label: "Total Profit", value: "+$12,847", change: "+8.2%", positive: true },
      { label: "Win Rate", value: "73.2%", change: "+2.1%", positive: true },
      { label: "Active Trades", value: "8", change: "-2", positive: false },
    ],
    activities: [
      { action: "Executed buy order", detail: "BTC/USD at $67,234", time: "2 minutes ago", type: "success" },
      { action: "Analysis complete", detail: "Market sentiment: Bullish", time: "15 minutes ago", type: "info" },
      { action: "Stop-loss triggered", detail: "ETH/USD position closed", time: "1 hour ago", type: "warning" },
    ],
  },
  {
    id: "news",
    name: "News Agent",
    status: "Running",
    metric: "24 updates",
    icon: Newspaper,
    iconColor: "text-cyan-400",
    description: "Real-time news aggregation and sentiment analysis from thousands of sources.",
    stats: [
      { label: "Articles Processed", value: "1,247", change: "+156", positive: true },
      { label: "Sentiment Score", value: "67%", change: "+5%", positive: true },
      { label: "Active Sources", value: "342" },
    ],
    activities: [
      { action: "Breaking news detected", detail: "Fed announces rate decision", time: "5 minutes ago", type: "warning" },
      { action: "Sentiment shift", detail: "Tech sector turning bullish", time: "23 minutes ago", type: "info" },
      { action: "New source added", detail: "Reuters API connected", time: "2 hours ago", type: "success" },
    ],
  },
  {
    id: "code",
    name: "Code Agent",
    status: "Building",
    metric: "3 projects",
    icon: Code2,
    iconColor: "text-orange-400",
    description: "Intelligent code generation and project scaffolding with best practices.",
    stats: [
      { label: "Projects Created", value: "47", change: "+3", positive: true },
      { label: "Lines Generated", value: "125K", change: "+12K", positive: true },
      { label: "Active Builds", value: "3" },
    ],
    activities: [
      { action: "Build started", detail: "E-commerce API scaffold", time: "10 minutes ago", type: "info" },
      { action: "Tests passed", detail: "Auth module: 24/24 tests", time: "45 minutes ago", type: "success" },
      { action: "Review needed", detail: "PR #847 awaiting approval", time: "2 hours ago", type: "warning" },
    ],
  },
  {
    id: "learning",
    name: "Learning Agent",
    status: "Learning",
    metric: "87% complete",
    icon: BookOpen,
    iconColor: "text-blue-400",
    description: "Personalized learning paths that adapt to your pace and preferences.",
    stats: [
      { label: "Courses Active", value: "12", change: "+2", positive: true },
      { label: "Completion Rate", value: "87%", change: "+4%", positive: true },
      { label: "Study Hours", value: "156" },
    ],
    activities: [
      { action: "Module completed", detail: "Advanced TypeScript patterns", time: "30 minutes ago", type: "success" },
      { action: "Quiz available", detail: "React Server Components", time: "1 hour ago", type: "info" },
      { action: "Streak milestone", detail: "30 days learning streak!", time: "Today", type: "success" },
    ],
  },
  {
    id: "research",
    name: "Research Agent",
    status: "Paused",
    metric: "15 papers",
    icon: Sparkles,
    iconColor: "text-purple-400",
    description: "Deep research capabilities across academic papers and technical documentation.",
    stats: [
      { label: "Papers Analyzed", value: "892", change: "+45", positive: true },
      { label: "Key Insights", value: "234" },
      { label: "Citations Found", value: "1,456" },
    ],
    activities: [
      { action: "Analysis paused", detail: "Awaiting API credits", time: "3 hours ago", type: "warning" },
      { action: "Paper summarized", detail: "Attention Is All You Need", time: "5 hours ago", type: "success" },
      { action: "New corpus added", detail: "ArXiv ML papers 2024", time: "1 day ago", type: "info" },
    ],
  },
]

const newsCategories = ["For You", "Tech", "Finance", "Sports", "Politics", "Science"]

const newsArticles = [
  {
    id: 1,
    category: "Finance",
    source: "Reuters",
    title: "Federal Reserve Signals Potential Rate Cuts in Coming Months",
    summary: "The Federal Reserve indicated it may begin cutting interest rates as inflation shows signs of cooling. Markets responded positively to the news, with major indices reaching new highs.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
    time: "2 hours ago",
    likes: 234,
    dislikes: 12,
  },
  {
    id: 2,
    category: "Tech",
    source: "TechCrunch",
    title: "OpenAI Announces Major Breakthrough in AI Reasoning Capabilities",
    summary: "The company revealed a new model architecture that demonstrates unprecedented logical reasoning abilities, marking a significant step toward artificial general intelligence.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    time: "4 hours ago",
    likes: 567,
    dislikes: 23,
  },
  {
    id: 3,
    category: "Sports",
    source: "ESPN",
    title: "Champions League Final: Historic Victory for Underdogs",
    summary: "In one of the most dramatic finals in recent memory, the underdog team secured a stunning 3-2 victory, capturing their first-ever European title.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop",
    time: "6 hours ago",
    likes: 892,
    dislikes: 45,
  },
  {
    id: 4,
    category: "Science",
    source: "Nature",
    title: "Scientists Discover New Method for Carbon Capture",
    summary: "Researchers have developed a revolutionary technique that could remove CO2 from the atmosphere at a fraction of the current cost, potentially transforming climate change mitigation efforts.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    time: "8 hours ago",
    likes: 445,
    dislikes: 8,
  },
  {
    id: 5,
    category: "Tech",
    source: "The Verge",
    title: "Apple Unveils Next-Generation Mixed Reality Headset",
    summary: "The tech giant announced its second-generation spatial computing device with improved displays, longer battery life, and a more affordable price point.",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&h=400&fit=crop",
    time: "12 hours ago",
    likes: 723,
    dislikes: 56,
  },
  {
    id: 6,
    category: "Finance",
    source: "Bloomberg",
    title: "Cryptocurrency Market Sees Record Institutional Investment",
    summary: "Major financial institutions have poured unprecedented amounts into digital assets this quarter, signaling growing mainstream acceptance of cryptocurrency.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    time: "1 day ago",
    likes: 334,
    dislikes: 89,
  },
]

import { AppShell } from "@/components/layout/AppShell"
import { Link2 } from "lucide-react"

export default function TradingDashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNewsCategory, setActiveNewsCategory] = useState("For You")
  const [activeAgentsExpanded, setActiveAgentsExpanded] = useState(false)

  // Custom states for trading page
  const [isRealData, setIsRealData] = useState(false)

  // Fetch from the real backend when isRealData is true
  const { data: tradingState, isLoading: isLoadingState } = useQuery({
    queryKey: ['tradingState'],
    queryFn: async () => {
      const res = await fetch('/api/trading/state')
      if (!res.ok) throw new Error('Failed to fetch trading state')
      return res.json()
    },
    enabled: isRealData,
    refetchInterval: 5000 // Poll every 5s for real data
  })

  // Use real data if enabled and available, otherwise fallback to mock
  const displayBalance = isRealData && tradingState ? `$${tradingState.balance.toLocaleString()}` : "$24,562.00"
  const displayStatus = isRealData && tradingState ? tradingState.status : "Running"

  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false)
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false)





  const runningAgents = agents.filter(a => a.status !== "Paused")

  return (
    <AppShell>
    <div className="h-screen w-full bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`${sidebarCollapsed ? "w-[60px]" : "w-[220px]"} h-full bg-zinc-900/80 border-r border-zinc-800/50 flex flex-col shrink-0 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white shrink-0">
              <span className="text-xs font-bold text-zinc-900">a.</span>
            </div>
            {!sidebarCollapsed && (
              <>
                <span className="text-white font-semibold text-sm">axel.ai</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-auto" />
              </>
            )}
          </div>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/50 rounded-md text-zinc-500 text-xs">
              <Search className="w-3.5 h-3.5" />
              <span>Search agents...</span>
              <span className="ml-auto text-[10px] bg-zinc-700/50 px-1.5 py-0.5 rounded">K</span>
            </div>
          </div>
        )}

        {/* Main nav */}
        <div className="px-3 space-y-0.5">
          <NavItem icon={Activity} label="Dashboard" active collapsed={sidebarCollapsed} />
          <NavItem icon={Bell} label="Notifications" badge={5} collapsed={sidebarCollapsed} />
        </div>

        {/* Overview section */}
        <div className="mt-5 px-3">
          {!sidebarCollapsed && (
            <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
              Overview
            </div>
          )}
          <div className="space-y-0.5 mt-1">
            <NavItem
              icon={Newspaper}
              label="News"
              color="text-cyan-400"
              collapsed={sidebarCollapsed}
              onClick={() => setSelectedAgent(agents.find(a => a.id === "news") || agents[0])}
              active={selectedAgent.id === "news"}
            />
            <NavItem
              icon={BookOpen}
              label="Notebook"
              color="text-blue-400"
              collapsed={sidebarCollapsed}
              onClick={() => setSelectedAgent(agents.find(a => a.id === "learning") || agents[0])}
              active={selectedAgent.id === "learning"}
            />
            <NavItem
              icon={Code2}
              label="Coding"
              color="text-orange-400"
              collapsed={sidebarCollapsed}
              onClick={() => setSelectedAgent(agents.find(a => a.id === "code") || agents[0])}
              active={selectedAgent.id === "code"}
            />
            <NavItem
              icon={TrendingUp}
              label="Trading"
              color="text-emerald-400"
              collapsed={sidebarCollapsed}
              onClick={() => setSelectedAgent(agents.find(a => a.id === "trading") || agents[0])}
              active={selectedAgent.id === "trading"}
            />
          </div>
          {/* Create your own */}
          {!sidebarCollapsed && (
            <div className="mt-2">
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-xs">Create your own</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mt-2 flex justify-center">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Active Agents dropdown */}
        <div className="mt-5 px-3">
          {!sidebarCollapsed ? (
            <div>
              <button
                onClick={() => setActiveAgentsExpanded(!activeAgentsExpanded)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    Active Agents
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">
                    {runningAgents.length}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${activeAgentsExpanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Dropdown content */}
              <motion.div
                initial={false}
                animate={{
                  height: activeAgentsExpanded ? "auto" : 0,
                  opacity: activeAgentsExpanded ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-0.5">
                  {runningAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                        selectedAgent.id === agent.id
                          ? "bg-zinc-800/80 text-white"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === "Running" ? "bg-emerald-500" :
                        agent.status === "Building" ? "bg-orange-500" :
                        agent.status === "Learning" ? "bg-blue-500" :
                        "bg-zinc-500"
                      }`} />
                      <agent.icon className={`w-4 h-4 ${agent.iconColor}`} />
                      <span className="flex-1 text-xs truncate">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setActiveAgentsExpanded(!activeAgentsExpanded)}
                className="relative flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 text-[9px] bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {runningAgents.length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom */}
        <div className="p-3 border-t border-zinc-800/50 mt-auto">
          <NavItem icon={Settings} label="Settings" collapsed={sidebarCollapsed} />
          <NavItem icon={HelpCircle} label="Help & Support" collapsed={sidebarCollapsed} />
        </div>
      </motion.div>

      {/* Detail Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 h-full bg-zinc-950 flex flex-col overflow-hidden"
      >
        {/* Header breadcrumb */}
        <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Agents</span>
            <span className="text-zinc-600">&rsaquo;</span>
            <span className={selectedAgent.iconColor}>{selectedAgent.name}</span>
            <span className="text-zinc-600">&rsaquo;</span>
            <span className="text-zinc-300">Overview</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedAgent.status === "Paused" ? (
              <button className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-md hover:bg-emerald-500/30 transition-colors">
                <Play className="w-3 h-3" />
                Resume
              </button>
            ) : (
              <button className="flex items-center gap-1.5 text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors">
                <Pause className="w-3 h-3" />
                Pause
              </button>
            )}
            <MoreHorizontal className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto scrollbar-hide">
          {selectedAgent.id === "news" ? (
            /* News View */
            <motion.div
              key="news-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {newsCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveNewsCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeNewsCategory === category
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* News articles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {newsArticles
                  .filter(article => activeNewsCategory === "For You" || article.category === activeNewsCategory)
                  .map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 overflow-hidden hover:border-zinc-700/50 transition-all group"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-zinc-900/90 backdrop-blur-sm rounded-full text-xs text-cyan-400 font-medium">
                            {article.source}
                          </span>
                          <span className="px-2.5 py-1 bg-zinc-900/90 backdrop-blur-sm rounded-full text-xs text-zinc-400">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-white font-semibold text-lg mb-2 leading-tight line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                          {article.summary}
                        </p>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-4">
                          <Clock className="w-3.5 h-3.5" />
                          {article.time}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 transition-colors group/btn">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-xs">{article.likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors group/btn">
                              <ThumbsDown className="w-4 h-4" />
                              <span className="text-xs">{article.dislikes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 transition-colors">
                              <Flag className="w-4 h-4" />
                              <span className="text-xs">Report</span>
                            </button>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-500/30 transition-colors">
                            Read article
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ) : (
            /* Default Agent View */
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center ${selectedAgent.iconColor}`}>
                      <selectedAgent.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-semibold">{selectedAgent.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedAgent.status === "Running" ? "bg-emerald-500" :
                          selectedAgent.status === "Building" ? "bg-orange-500" :
                          selectedAgent.status === "Learning" ? "bg-blue-500" :
                          "bg-zinc-500"
                        }`} />
                        <span className="text-zinc-500 text-xs">{selectedAgent.status}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm max-w-xl">{selectedAgent.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {selectedAgent.stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                  >
                    <div className="text-zinc-500 text-xs mb-1">{stat.label}</div>
                    <div className="flex items-end justify-between">
                      <div className={`text-lg font-semibold ${stat.label.includes("Profit") ? "text-emerald-400" : "text-white"}`}>
                        {stat.value}
                      </div>
                      {stat.change && (
                        <div className={`flex items-center gap-0.5 text-xs ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>
                          {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {stat.change}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/50 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-zinc-400 text-sm font-medium">Performance Overview</div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors">24h</button>
                    <button className="text-xs text-white bg-zinc-800 px-2 py-1 rounded">7d</button>
                    <button className="text-xs text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors">30d</button>
                    <button className="text-xs text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors">All</button>
                  </div>
                </div>
                <div className="h-40 flex items-end gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 62, 78, 92, 68, 84, 72, 90, 85].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                      className={`flex-1 rounded-t ${
                        selectedAgent.iconColor.includes("emerald") ? "bg-emerald-500/60" :
                        selectedAgent.iconColor.includes("cyan") ? "bg-cyan-500/60" :
                        selectedAgent.iconColor.includes("orange") ? "bg-orange-500/60" :
                        selectedAgent.iconColor.includes("blue") ? "bg-blue-500/60" :
                        "bg-purple-500/60"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="text-xs text-zinc-500 font-medium mb-4 uppercase tracking-wider">Recent Activity</div>
                <div className="space-y-3">
                  {selectedAgent.activities.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <ActivityItem
                        action={activity.action}
                        detail={activity.detail}
                        time={activity.time}
                        type={activity.type}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>

      {/* Integration Modal */}
      {isIntegrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Integrations</h2>
            <p className="text-zinc-400 text-sm mb-6">Connect to real brokerage/exchange APIs.</p>
            <div className="space-y-3">
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                <Search className="w-4 h-4 mr-2" /> Search for Integrations
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Create Integration
              </button>
            </div>
            <button
              onClick={() => setIsIntegrationModalOpen(false)}
              className="mt-6 w-full text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Workflow Modal */}
      {isWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Add Workflow</h2>
            <p className="text-zinc-400 text-sm mb-6">Create a new Gemini-powered trading workflow.</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Workflow Name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                <Sparkles className="w-4 h-4 mr-2" /> Generate with Gemini
              </button>
            </div>
            <button
              onClick={() => setIsWorkflowModalOpen(false)}
              className="mt-6 w-full text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </AppShell>
  )
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
  hasSubmenu,
  color,
  collapsed,
  onClick,
}: {
  icon: React.ElementType
  label: string
  badge?: number
  active?: boolean
  hasSubmenu?: boolean
  color?: string
  collapsed?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${color || ""}`} />
      {!collapsed && (
        <>
          <span className="flex-1 text-xs">{label}</span>
          {badge && (
            <span className="bg-blue-500/80 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
              {badge}
            </span>
          )}
          {hasSubmenu && <ChevronRight className="w-3 h-3 text-zinc-600" />}
        </>
      )}
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

  const dotColors = {
    success: "bg-emerald-400",
    info: "bg-blue-400",
    warning: "bg-amber-400",
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-1.5 ${dotColors[type]}`} />
      <div className="flex-1">
        <p className="text-zinc-300 text-sm">
          <span className={typeColors[type]}>{action}</span>
          <span className="text-zinc-500"> &middot; {detail}</span>
        </p>
        <p className="text-zinc-600 text-xs mt-0.5">{time}</p>
      </div>
    </div>
  )
}
