import { useEffect, useState, useRef, useCallback } from "react"
import { BvCard, BvCardHeader, BvCardContent, BvTrimString, BvButton } from "@shared/components"
import { cn } from "@shadcn/lib/utils"
import ShowJsObject from "./ShowJsObject"

export default function ParentState({ parentState }) {
  const [changedKeys, setChangedKeys] = useState({})
  const [copied, setCopied] = useState(false)
  const prevStateRef = useRef(null)

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(parentState, null, 2))
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 5000)
      })
  }, [parentState])

  useEffect(() => {
    if (parentState?.state && prevStateRef.current?.state) {
      const currentState = parentState.state
      const previousState = prevStateRef.current.state

      // Find which keys have changed
      const newChangedKeys = {}

      if (typeof currentState === 'object' && currentState !== null) {
        Object.keys(currentState).forEach(key => {
          if (JSON.stringify(currentState[key]) !== JSON.stringify(previousState?.[key])) {
            newChangedKeys[key] = true
          }
        })
      } else if (currentState !== previousState) {
        newChangedKeys.value = true
      }

      if (Object.keys(newChangedKeys).length > 0) {
        setChangedKeys(newChangedKeys)
        const timer = setTimeout(() => {
          setChangedKeys({})
        }, 2000)
        return () => clearTimeout(timer)
      }
    }

    prevStateRef.current = parentState
  }, [parentState])

  if (!parentState) {
    return null
  }

  const { component, state } = parentState

  return (
    <div className="p-4">
      <style jsx>{`
        @keyframes pulse {
          0% { background-color: rgba(59, 130, 246, 0); }
          50% { background-color: rgba(59, 130, 246, 0.15); }
          100% { background-color: rgba(59, 130, 246, 0); }
        }
        .highlight-change {
          animation: pulse 2s ease-in-out;
        }
      `}</style>
      <BvCard variant="neutral">
        <BvCardHeader
          title="Parent State"
          subTitle={component}
          subTitleVariant="muted"
          secondarySection={
            <BvButton
              variant="icon"
              size="sm"
              startIcon={copied ? "check" : "clipboard-copy"}
              onClick={handleCopyAll}
              title={copied ? "Copied!" : "Copy state"}
            />
          }
        />
        <BvCardContent>
          <div className="mt-2">
            {typeof state === 'object' && state !== null ? (
              <ShowJsObject data={state} highlightedKeys={changedKeys} />
            ) : (
              <div
                className={cn(
                  "p-2 bg-gray-50 rounded text-sm",
                  { "highlight-change": changedKeys.value }
                )}
              >
                <BvTrimString string={String(state)} />
              </div>
            )}
          </div>
        </BvCardContent>
      </BvCard>
    </div>
  )
}
