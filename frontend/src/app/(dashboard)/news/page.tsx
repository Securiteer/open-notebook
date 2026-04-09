"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react"
import { useTranslation } from "@/lib/hooks/use-translation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { newsApi, NewsArticle } from "@/lib/api/news"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"

const newsCategories = ["For You", "Tech", "Finance", "Sports", "Politics", "Science"]

export default function NewsPage() {
  const { t } = useTranslation()
  const [activeNewsCategory, setActiveNewsCategory] = useState("For You")

  const { data: articles = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsApi.getNews(),
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{t.navigation.news || "News"}</h1>
          <p className="text-muted-foreground text-sm">
            Real-time news aggregation and analysis.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <motion.div
          key="news-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full"
        >
          {/* Categories */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none shrink-0">
            {newsCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveNewsCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeNewsCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* News articles */}
          <ScrollArea className="flex-1 -mx-4 px-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="text-destructive text-center py-10">
                Failed to load news. Please try again.
              </div>
            ) : articles.length === 0 ? (
              <div className="text-muted-foreground text-center py-10">
                No articles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                {articles
                  .filter(article => activeNewsCategory === "For You" || article.category === activeNewsCategory)
                  .map((article, i) => (
                    <motion.div
                      key={article.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="group bg-card rounded-xl border overflow-hidden hover:border-border/80 transition-all hover:shadow-md flex flex-col h-full"
                    >
                      {article.image && (
                        <div className="aspect-video bg-muted relative overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-md">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-primary">{article.source}</span>
                          {!article.image && (
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-md">
                              {article.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-foreground font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                          {article.summary}
                        </p>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-4">
                          <Clock className="w-3.5 h-3.5" />
                          {article.time}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-emerald-500 transition-colors group/btn">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-xs">{article.likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group/btn">
                              <ThumbsDown className="w-4 h-4" />
                              <span className="text-xs">{article.dislikes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-amber-500 transition-colors">
                              <Flag className="w-4 h-4" />
                              <span className="text-xs">Report</span>
                            </button>
                          </div>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            Read article
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  )
}
