import { apiClient } from './client'

export interface NewsArticle {
  id: string
  category: string
  source: string
  title: string
  summary: string
  image: string | null
  url: string
  time: string
  published_date: string | null
  likes: number
  dislikes: number
}

export const newsApi = {
  getNews: async (): Promise<NewsArticle[]> => {
    const { data } = await apiClient.get<NewsArticle[]>('/news')
    return data
  },
}
