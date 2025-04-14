import { cn } from "@shadcn/lib/utils"
import { BvButton, BvTrimString } from "@shared/components"
import { useCallback, useEffect, useState } from "react"

export default function ShowJsObject({ data, highlightedKeys = {} }) {
	const [expandedKeys, setExpandedKeys] = useState({})
	const [copiedKey, setCopiedKey] = useState(null)

	const toggleKeyExapnd = useCallback((key) => () => {
		setExpandedKeys((prev) => {
			const newExpandedKeys = { ...prev }
			if (newExpandedKeys[key]) {
				delete newExpandedKeys[key]
			} else {
				newExpandedKeys[key] = true
			}
			return newExpandedKeys
		})
	}, [setExpandedKeys])

	const handleCopy = useCallback((key, value) => () => {
		const stringValue = typeof value === 'object' && value !== null
			? JSON.stringify(value)
			: String(value)

		navigator.clipboard.writeText(stringValue).then(() => {
			setCopiedKey(key)
			setTimeout(() => setCopiedKey(null), 5000)
		})
	}, [])

	useEffect(() => {
		const handleKeyPress = (event) => {
			if (event.key === "Enter") {
				toggleKeyExapnd(event.target.dataset.key)
			}
		}

		const keys = Object.keys(data)
		keys.forEach((key) => {
			const element = document.querySelector(`[data-key="${key}"]`)
			if (element) {
				element.addEventListener("keypress", handleKeyPress)
			}
		})

		return () => {
			keys.forEach((key) => {
				const element = document.querySelector(`[data-key="${key}"]`)
				if (element) {
					element.removeEventListener("keypress", handleKeyPress)
				}
			})
		}
	}, [data])

	return (
		<div className="flex flex-col gap-2">
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
			{Object.entries(data).map(([key, value]) => {
				const isExpandable = typeof value === 'object' && value !== null
				const stringifiedValue = isExpandable
					? JSON.stringify(value, null, 2)
					: String(value)

				return (
					<div
						key={key}
						className={cn(
							"overflow-hidden rounded-md transition-colors duration-200",
							{
								"bg-gray-50 hover:bg-gray-100": !expandedKeys[key],
								"border border-gray-200": expandedKeys[key],
								"highlight-change": highlightedKeys[key]
							}
						)}
					>
						<div
							className={cn(
								"flex items-center gap-2 p-1 cursor-pointer flex-nowrap overflow-hidden",
								{ "border-b border-gray-200": expandedKeys[key] }
							)}
							data-key={key}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === 'Enter' && toggleKeyExapnd(key)()}
						>
							<div className="flex items-center gap-1 shrink-0">
								<BvButton
									variant="icon"
									size="sm"
									className="opacity-70 hover:opacity-100"
									onClick={handleCopy(key, value)}
									startIcon={copiedKey === key ? "check" : "clipboard"}
									title={copiedKey === key ? "Copied!" : "Copy value"}
								/>
								<span
									className="text-blue-500 cursor-pointer"
									onClick={toggleKeyExapnd(key)}
								>
									{expandedKeys[key] ? "▼" : "▶"}
								</span>
							</div>
							<BvTrimString string={key} length={20} from="center" className="text-sm font-medium text-gray-900"/>
							{!expandedKeys[key] && (
                <div className="text-sm text-gray-600 grow overflow-hidden px-1 flex items-center font-mono">
									:&nbsp;
                  <BvTrimString string={stringifiedValue} />
								</div>
							)}
						</div>

						{expandedKeys[key] && (
							<div className={cn(
								"text-sm p-2 font-mono text-gray-700 bg-gray-50",
								isExpandable ? "whitespace-pre-wrap max-h-[25rem] overflow-y-auto" : "overflow-auto"
							)}>
								{isExpandable ? (
									stringifiedValue
								) : (
									<span className="text-blue-700">{stringifiedValue}</span>
								)}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
