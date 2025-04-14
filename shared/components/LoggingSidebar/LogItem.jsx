import { cn } from "@shadcn/lib/utils"
import { BvButton, BvTrimString } from "@shared/components"
import { useCallback, useMemo, useState } from "react"
import ShowJsObject from "./ShowJsObject"

export default function LogItem({ log, isExpanded, toggleExpand, typeName, seq }) {
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(JSON.stringify(log, null, 2))
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			})
	}, [log])

	const getLogTitle = () => {
		if (log.type === 'action' || log.type === 'validate-action') {
			return log.handlerName || 'Unknown action'
		}
		if (['apiRequest', 'apiResponse', 'apiError'].includes(log.type)) {
			return log.apiName || 'API call'
		}
		if (log.type === 'error') {
			return 'Error'
		}
		if (log.type === 'render') {
			return 'Component Render'
		}
		if (log.type === 'custom') {
			return log.eventName || 'Custom event'
		}
		return 'Event'
	}

	const data = useMemo(() => {
		if (log.type === 'action') return log.args
		if (log.type === 'validate-action') return log.args
		if (log.type === 'apiRequest') return log.requestData
		if (log.type === 'apiResponse') return log.responseData
		if (log.type === 'apiError') return log.error
		if (log.type === 'error') return { error: log.error, stack: log.stack }
		if (log.type === 'render') return log.props
		if (log.type === 'custom') return log.data
		return log
	}, [log])

	const getTypeColor = () => {
		switch (log.type) {
			case 'action': return 'bg-blue-100 text-blue-800'
			case 'validate-action': return 'bg-blue-100 text-blue-800'
			case 'apiRequest': return 'bg-purple-100 text-purple-800'
			case 'apiResponse': return 'bg-green-100 text-green-800'
			case 'apiError':
			case 'error': return 'bg-red-100 text-red-800'
			case 'render': return 'bg-gray-100 text-gray-800'
			default: return 'bg-amber-100 text-amber-800'
		}
	}

	const previewData = useMemo(() => {
		let preview = ''
		if (log.type === 'action' || log.type === 'validate-action') {
			preview = log.args
		}
		if ('apiRequest' === log.type) {
			preview = log.requestData?.args
		}
		if ('apiResponse' === log.type) {
			preview = log.responseData
		}
		if ('apiError' === log.type) {
			preview = log.error
		}
		if ('error' === log.type) {
			preview = log.error
		}
		if ('render' === log.type) {
			preview = log.props
		}
		if ('custom' === log.type) {
			preview = log.data
		}
		return JSON.stringify(preview || '')
	}, [log])

	const hasData = data !== undefined && data !== null &&
		(typeof data !== 'object' || Object.keys(data).length > 0)

	return (
		<div className={cn(
			"rounded-md transition-all duration-200",
			{
				"border border-gray-200 shadow-sm": isExpanded,
				"hover:bg-gray-50": !isExpanded
			}
		)}>
			<div
				className={cn(
					"flex items-center gap-2 p-2 cursor-pointer flex-nowrap overflow-hidden",
					{ "border-b border-gray-200": isExpanded && hasData }
				)}
				onClick={toggleExpand}
			>
				<span className={cn("text-xs", { "text-blue-500": isExpanded })}>
					{isExpanded ? "▼" : "▶"}
				</span>

				<div className={cn(
					"text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap",
					getTypeColor()
				)}>
					{seq + 1} - {typeName}
				</div>

				<div className="whitespace-nowrap">
					<BvTrimString string={getLogTitle()} length={30} from="start" className="text-sm font-medium text-gray-700" />
					{log.component && (
						<div className="text-xs text-gray-500 mr-1">[{log.component}]</div>
					)}
				</div>

				<div className="grow">
					{(isExpanded && hasData) ? null : <BvTrimString string={previewData} className="text-xs text-gray-500" />}
				</div>

				<div className="flex items-center gap-1">
					<BvButton
						variant="icon"
						size="sm"
						className="opacity-70 hover:opacity-100"
						onClick={(e) => {
							e.stopPropagation(); handleCopy()
						}}
						startIcon={copied ? "check" : "clipboard"}
						title={copied ? "Copied!" : "Copy log"}
					/>
				</div>
			</div>

			{isExpanded && hasData && (
				<div className="p-2 bg-gray-50">
					{typeof data === 'object' ? (
						<ShowJsObject data={data} />
					) : (
						<div className="text-sm font-mono text-gray-700 p-2 bg-white rounded border border-gray-200">
							{String(data)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
