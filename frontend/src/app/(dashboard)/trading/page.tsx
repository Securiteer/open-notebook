import { BetaPlaceholder } from '@/components/layout/BetaPlaceholder'

export default function TradingPage() {
  return (
    <div className="flex h-full w-full p-4 bg-zinc-950">
      <BetaPlaceholder
        id="trading"
        name="Trading"
        description="Automated trading strategies powered by real-time market analysis and ML predictions."
        iconType="trading"
      />
    </div>
  )
}
