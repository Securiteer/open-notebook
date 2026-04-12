import { BetaPlaceholder } from '@/components/layout/BetaPlaceholder'

export default function CodePage() {
  return (
    <div className="flex h-full w-full p-4 bg-zinc-950">
      <BetaPlaceholder
        id="code"
        name="Coding"
        description="Write, edit, and manage your code projects."
        iconType="code"
      />
    </div>
  )
}
