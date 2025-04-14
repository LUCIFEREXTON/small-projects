// app/javascript/horizon/tests/shared/components/TestDebugPanel.js
import React, {
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import { Button } from '@shadcn-components/button'

const TestDebugPanel = forwardRef(({ inspectableStates = {} }, ref) => {
  const [visible, setVisible] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [propsMap, setPropsMap] = useState({})
  const [eventLogs, setEventLogs] = useState([])
  const [expandedArgs, setExpandedArgs] = useState({})

  useImperativeHandle(ref, () => ({
    logProps: (componentName, props) => {
      setPropsMap(prev => ({
        ...prev,
        [componentName]: props
      }))
    },
    logEvent: (handlerName, args, props) => {
      setEventLogs(prev => [
        ...prev,
        {
          handlerName,
          args,
          componentName: Object.keys(propsMap)[0],
          componentProps: props
        }
      ])
    }
  }))

  const copyLog = (log) => {
    const text =
      `Component: ${log.componentName} Props: ${JSON.stringify(log.componentProps)}\n` +
      `Handler: ${log.handlerName} Args: ${JSON.stringify(log.args)}`
    navigator.clipboard.writeText(text)
  }

  const copyAllLogs = () => {
    const text = eventLogs
      .map(log =>
        `Component: ${log.componentName} Props: ${JSON.stringify(log.componentProps)}\n` +
        `Handler: ${log.handlerName} Args: ${JSON.stringify(log.args)}`
      ).join('\n\n')
    navigator.clipboard.writeText(text)
  }

  if (!visible) return null

  if (collapsed) {
    return (
      <div className="w-12 flex items-center justify-center border-l bg-gray-100 h-full">
        <Button size="icon" variant="outline" onClick={() => setCollapsed(false)}>
          &gt;
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[400px] border-l h-full flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Test Debug Panel</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCollapsed(true)}>
            Collapse
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setVisible(false)}>
            Close Forever
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm">

        {/* Props */}
        <section className="mb-6">
          <h3 className="font-medium mb-2">Props</h3>
          <div className="border p-2 rounded text-xs bg-white max-h-48 overflow-y-auto">
            {Object.entries(propsMap).map(([component, props], idx) => (
              <div key={idx} className="mb-4">
                <div className="font-semibold mb-1">{component}</div>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(props, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* States */}
        <section className="mb-6">
          <h3 className="font-medium mb-2">Inspectable States</h3>
          <div className="border p-2 rounded text-xs bg-white max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(inspectableStates, null, 2)}
            </pre>
          </div>
        </section>

        {/* Event Logs */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Event Logs</h3>
            <Button variant="outline" size="xs" onClick={copyAllLogs}>
              Copy All
            </Button>
          </div>
          <div className="border p-2 rounded text-xs bg-white max-h-48 overflow-y-auto">
            {eventLogs.map((log, idx) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold">{log.handlerName}</div>
                <div className="text-gray-600">
                  Args:{' '}
                  <span
                    className="text-blue-600 cursor-pointer underline"
                    onClick={() =>
                      setExpandedArgs(prev => ({
                        ...prev,
                        [idx]: !prev[idx]
                      }))
                    }
                  >
                    {expandedArgs[idx]
                      ? '(hide)'
                      : JSON.stringify(log.args)}
                  </span>
                  {expandedArgs[idx] && (
                    <pre className="whitespace-pre-wrap break-words mt-1">
                      {JSON.stringify(log.args, null, 2)}
                    </pre>
                  )}
                </div>
                <Button
                  variant="link"
                  size="xs"
                  onClick={() => copyLog(log)}
                >
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
})

export default TestDebugPanel
