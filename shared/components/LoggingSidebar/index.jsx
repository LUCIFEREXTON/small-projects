import { Sidebar, SidebarContent, SidebarHeader } from '@shadcn-components/sidebar'
import { BvButton, BvSubHeader } from '@shared/components'
import { loggingEvent } from '@shared/helpers/logger'
import { useCallback, useEffect, useState } from 'react'
import LastAction from './LastAction'
import LogsView from './LogsView'
import ParentState from './ParentState'
import PassedProps from './PassedProps'

export default function LoggingSidebar() {
	const [lastAction, setLastAction] = useState(null)
	const [parentState, setParentState] = useState(null)
	const [logs, setLogs] = useState([])
	const [passedProps, setPassedProps] = useState({})

	useEffect(() => {
		const handleEventLog = event => {
			const eventName = event.detail.event
			let newLog = null

			switch (eventName) {
			case "init": {
				const { component, data: { props } } = event.detail
				newLog = { component, props, type: 'render' }
				break
			}
			case "validate-action": {
				const { component, data: { handlerName, args, isCorrect } } = event.detail
				setLastAction({
					component,
					handlerName,
					args: args,
					isCorrect: isCorrect,
				})
				newLog = { component, handlerName, args, type: 'validate-action' }
				break
			}
			case "action": {
				const { component, data: { handlerName, args } } = event.detail
				newLog = { component, handlerName, args, type: 'action' }
				break
			}
			case "apiRequest": {
				const { component, data: { apiName, requestData } } = event.detail
				newLog = { component, apiName, requestData, type: 'apiRequest' }
				break
			}
			case "apiResponse": {
				const { component, data: { apiName, responseData } } = event.detail
				newLog = { component, apiName, responseData, type: 'apiResponse' }
				break
			}
			case "apiError": {
				const { component, data: { apiName, error } } = event.detail
				newLog = { component, apiName, error, type: 'apiError' }
				break
			}
			case "error": {
				const { component, data: { error, stack } } = event.detail
				newLog = { component, error, stack, type: 'error' }
				break
			}
			case "state": {
				const { component, data } = event.detail
				setParentState({ component, state: data })
				break
			}
			case "props": {
				const { component, data } = event.detail
				setPassedProps((prev) => ({ ...prev, [component]: data }))
				break
			}
			default: {
				const { component, data } = event.detail
				newLog = {
					component,
					eventName,
					data,
					type: 'custom'
				}
				break
			}
			}

			if (newLog) {
				setLogs(prevLogs => [...prevLogs, newLog])
			}
		}

		loggingEvent.addEventListener('DEBUG', handleEventLog)

		return () => {
			loggingEvent.removeEventListener('DEBUG', handleEventLog)
		}
	}, [])

	const resetLogs = useCallback(() => {
		setLogs([])
		setLastAction(null)
		setParentState(null)
		setPassedProps({})
	}, [])

	return (
		<Sidebar>
			<SidebarHeader className="flex-row gap-4 items-center justify-between p-4">
				<BvSubHeader title="Logging" icon="logs" />
				<BvButton onClick={resetLogs}>
          Reset Logs
				</BvButton>
			</SidebarHeader>
			<SidebarContent className="flex flex-col gap-2 px-4 pb-4">
				<LastAction lastAction={lastAction} />
				<ParentState parentState={parentState} />
				<PassedProps passedProps={passedProps} />
				<LogsView logs={logs} />
			</SidebarContent>
		</Sidebar>
	)
}
