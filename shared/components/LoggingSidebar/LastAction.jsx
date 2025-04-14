import { useEffect, useState, useRef, useCallback } from "react"
import { BvCard, BvCardHeader, BvCardContent, BvTrimString, BvButton } from "@shared/components"
import ShowJsObject from "./ShowJsObject"
import { cn } from "@shadcn/lib/utils"

export default function LastAction({ lastAction }) {
	const [highlight, setHighlight] = useState(false)
	const [copied, setCopied] = useState(false)
	const prevActionRef = useRef(null)

	const handleCopyAll = useCallback(() => {
		navigator.clipboard.writeText(JSON.stringify(lastAction, null, 2))
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 5000)
			})
	}, [lastAction])

	useEffect(() => {
		if (lastAction && JSON.stringify(lastAction) !== JSON.stringify(prevActionRef.current)) {
			setHighlight(true)
			const timer = setTimeout(() => setHighlight(false), 2000)
			prevActionRef.current = lastAction
			return () => clearTimeout(timer)
		}
	}, [lastAction])

	if (!lastAction) {
		return null
	}

	const { component, handlerName, args, isCorrect } = lastAction

	return (
		<div className="p-4">
			<style jsx>{`
				@keyframes shake {
					0% { transform: translateX(0) scale(1.02); }
					10% { transform: translateX(-2px) scale(1.02); }
					20% { transform: translateX(2px) scale(1.02); }
					30% { transform: translateX(-2px) scale(1.02); }
					40% { transform: translateX(2px) scale(1.02); }
					50% { transform: translateX(-1px) scale(1.02); }
					60% { transform: translateX(1px) scale(1.02); }
					70% { transform: translateX(-1px) scale(1.02); }
					80% { transform: translateX(1px) scale(1.02); }
					90% { transform: translateX(-1px) scale(1.02); }
					100% { transform: translateX(0) scale(1.02); }
				}
				.shake {
					animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
				}
			`}</style>
			<BvCard
				variant="neutral"
				className={cn(
					"border-l-4 transition-all duration-300",
					{
						"border-l-green-500 bg-green-50": isCorrect,
						"border-l-red-500 bg-red-50": !isCorrect,
						"shadow-lg shake": highlight,
						"shadow-none scale-100": !highlight
					}
				)}
			>
				<BvCardHeader
					title={handlerName}
					subTitle={component}
					subTitleVariant="muted"
					secondarySection={
						<div className="flex items-center gap-2">
							<BvButton
								variant="icon"
								size="sm"
								startIcon={copied ? "check" : "clipboard-copy"}
								onClick={handleCopyAll}
								title={copied ? "Copied!" : "Copy action data"}
							/>
							<div className={cn(
								"flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
								{
									"bg-green-100 text-green-800": isCorrect,
									"bg-red-100 text-red-800": !isCorrect
								}
							)}>
								{isCorrect ? "Success" : "Failure"}
							</div>
						</div>
					}
				/>
				<BvCardContent>
					<div className="mt-2">
						<h3 className="text-sm font-medium text-gray-600 mb-1">Arguments:</h3>
						{typeof args === 'object' && args !== null ? (
							<ShowJsObject data={args} />
						) : (
							<div className="p-2 bg-gray-50 rounded text-sm">
								<BvTrimString string={String(args)} />
							</div>
						)}
					</div>
				</BvCardContent>
			</BvCard>
		</div>
	)
}
