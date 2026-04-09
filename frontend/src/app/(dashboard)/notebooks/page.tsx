import { BetaPlaceholder } from '@/components/layout/BetaPlaceholder'

export default function NotebooksPage() {
  return (
    <div className="flex h-full w-full p-4 bg-zinc-950">
      <BetaPlaceholder
        id="notebook"
        name="Notebooks"
        description="Capture ideas, take notes, and organize your thoughts."
        iconType="notebook"
      />
    </div>
  )
}
