import { BvCard } from "@shared/components"

export default function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <BvCard variant="widget">
        {children}
      </BvCard>
    </div>
  )
}
