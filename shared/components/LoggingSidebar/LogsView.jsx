import { BvButton, BvCard, BvCardContent, BvCardHeader, BvSelect, BvTextField } from "@shared/components"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import LogItem from "./LogItem"

const TYPE_NAME = {
	action: 'Action',
	'validate-action': 'Validation Action',
	render: 'Component Props',
	apiRequest: 'API Request',
	apiResponse: 'API Response',
	apiError: 'API Error',
	error: 'Error',
	custom: 'Custom Event'
}

const typeOptions = [
	{ value: 'action', label: 'Action' },
	{ value: 'validate-action', label: 'Validation Action' },
	{ value: 'render', label: 'Component Props' },
	{ value: 'apiRequest', label: 'API Request' },
	{ value: 'apiResponse', label: 'API Response' },
	{ value: 'apiError', label: 'API Error' },
	{ value: 'error', label: 'Error' },
	{ value: 'custom', label: 'Custom Event' }
]

export default function LogsView({ logs = [] }) {
	const [typesToShow, setTypesToShow] = useState([])
	const [textFilter, setTextFilter] = useState('')
	const [copied, setCopied] = useState(false)
	const [expandedLogs, setExpandedLogs] = useState({})
	const logsContainerRef = useRef(null)
	const prevLogsLengthRef = useRef(logs.length)

	const filteredLogs = useMemo(() => {
		let filtered = logs

		if (typesToShow.length > 0) {
			filtered = filtered.filter(log => typesToShow.includes(log.type))
		}

		if (textFilter.trim()) {
			filtered = filtered.filter(log => {
				const logString = JSON.stringify(log).toLowerCase()
				return logString.includes(textFilter.toLowerCase())
			})
		}

		return filtered
	}, [logs, typesToShow, textFilter])

	// Scroll to bottom when new logs are added
	useEffect(() => {
		if (logs.length > prevLogsLengthRef.current && logsContainerRef.current) {
			logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
		}
		prevLogsLengthRef.current = logs.length
	}, [logs.length])

	const copyLogs = useCallback(() => {
		navigator.clipboard.writeText(JSON.stringify(filteredLogs, null, 2))
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			})
	}, [filteredLogs])

	const toggleLogExpand = useCallback((logId) => {
		setExpandedLogs(prev => {
			const newState = { ...prev }
			newState[logId] = !prev[logId]
			return newState
		})
	}, [])

	const clearFilters = useCallback(() => {
		setTypesToShow([])
		setTextFilter('')
	}, [])

	return (
		<BvCard variant="neutral" className="mt-4 grow overflow-y-auto min-h-[25rem]">
			<BvCardHeader
				title="Activity Logs"
				subTitleVariant="muted"
				subTitle={`${filteredLogs.length} of ${logs.length} logs`}
				secondarySection={
					<BvButton
						variant="icon"
						size="sm"
						startIcon={copied ? "check" : "clipboard-copy"}
						onClick={copyLogs}
						title={copied ? "Copied!" : "Copy filtered logs"}
					/>
				}
			/>
			<BvCardContent className="grow flex flex-col gap-4 py-2 overflow-y-hidden">
				<div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-stretch [&>div]:grow [&>div]:min-w-[200px]">
					<BvSelect
						placeholder="Filter by type"
						value={typesToShow}
						onChange={setTypesToShow}
						multiple
						size="md"
						defaultValue={[]}
						options={typeOptions}
						getShowValue={({ selected, options }) => {
							if (selected.length === 0) return 'Filter by type'
							return selected.map((v) => options.find((option) => option.value === v)?.label).join(', ')
						}}
					/>
					<BvTextField
						placeholder="Filter by content"
						value={textFilter}
						onChange={(e) => setTextFilter(e.target.value)}
						size="md"
						startIcon="search"
					/>
				</div>

				{(typesToShow.length > 0 || textFilter.trim()) && (
					<div className="flex items-center">
						<div className="text-xs text-gray-500">
							<span className="font-medium">Filters applied:</span>
							{typesToShow.length > 0 && (
								<span className="ml-1">
									{typesToShow.map(type => TYPE_NAME[type]).join(', ')}
								</span>
							)}
							{typesToShow.length > 0 && textFilter.trim() && ' | '}
							{textFilter.trim() && (
								<span>Text containing &ldquo;{textFilter}&ldquo;</span>
							)}
						</div>
						<BvButton
							size="sm"
							variant="link"
							className="ml-auto text-xs"
							onClick={clearFilters}
						>
              Clear filters
						</BvButton>
					</div>
				)}

				<div className="border-t flex flex-col grow overflow-y-auto pr-1 pt-2" ref={logsContainerRef}>
					{filteredLogs.length > 0 ? (
						filteredLogs.map((log, index) => (
							<LogItem
								key={index}
								log={log}
								isExpanded={!!expandedLogs[index]}
								toggleExpand={() => toggleLogExpand(index)}
								typeName={TYPE_NAME[log.type] || 'Unknown'}
								seq={index}
							/>
						))
					) : (
						<div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded-md">
              No logs available matching your filters.
						</div>
					)}
				</div>
			</BvCardContent>
		</BvCard>
	)
}
