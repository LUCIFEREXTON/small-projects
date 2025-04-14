import React, { memo, useEffect, useRef } from 'react'
import { logComponentInit } from '../helpers/logger'

/**
 * Higher-Order Component to wrap components with automatic logging.
 *
 * @param {React.Component} WrappedComponent - The component to wrap.
 * @param {string} componentName - Name of the component for logging.
 * @returns {React.Component} - Enhanced component with logging.
 */
const withLogger = (WrappedComponent, componentName) => {
	const EnhancedComponent = (props) => {
		const firstRender = useRef(true)
		if (firstRender.current) {
			logComponentInit(componentName, props)
			firstRender.current = false
		}

		useEffect(() => {
			logComponentInit(componentName, props)

			return () => {
				logComponentInit(`${componentName} __UNMOUNT__`)
			}
		}, [componentName, props])

		return <WrappedComponent {...props} />
	}

	return memo(EnhancedComponent)
}

export default withLogger
