import { getErrorMessage } from "./utils"


export const loggingEvent = new EventTarget()

/**
 * Logging Utility Library
 *
 * Provides structured and consistent logging throughout the React application.
 * Logs are emitted only when debugging is enabled via a global flag.
 * Sensitive data is sanitized to prevent accidental exposure.
 */

// List of sensitive keys to sanitize from logs
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey']

/**
 * Checks if the application is in debug mode.
 *
 * Debug mode can be enabled via:
 * - Environment variable: REACT_APP_DEBUG=true
 * - Global variable: window.isTestEnvironment = true
 *
 * @returns {boolean} - True if debug mode is enabled, else false.
 */
export const isDebugMode = () => {
	return window.__APP_DEBUG__ === true
}

/**
 * Recursively sanitizes data by masking sensitive information.
 *
 * @param {any} data - The data to sanitize.
 * @returns {any} - Sanitized data with sensitive information masked.
 */
const sanitizeData = (data) => {
	if (typeof data !== 'object' || data === null) return data

	if (Array.isArray(data)) {
		return data.map(item => sanitizeData(item))
	}

	// Handle special objects
	if (data instanceof File) {
		return {
			__type: 'File',
			name: data.name,
			size: data.size,
			type: data.type,
			lastModified: data.lastModified
		}
	}

	if (data instanceof Image || data instanceof HTMLImageElement) {
		return {
			__type: 'Image',
			src: data.src ? (data.src.length > 100 ? `${data.src.substring(0, 100)  }...` : data.src) : null,
			width: data.width,
			height: data.height,
			alt: data.alt || 'image'
		}
	}

	if (data instanceof HTMLElement) {
		return {
			__type: 'HTMLElement',
			tagName: data.tagName,
			id: data.id,
			className: data.className
		}
	}

	if (data instanceof Error) {
		return {
			__type: 'Error',
			message: data.message,
			name: data.name,
			stack: data.stack
		}
	}

	// Handle any other object that might cause issues with JSON.stringify
	if (typeof data.toJSON !== 'function' && Object.prototype.toString.call(data) !== '[object Object]') {
		return `[${data.constructor?.name || 'Object'}: ${String(data)}]`
	}

	const sanitized = {}
	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			if (SENSITIVE_KEYS.includes(key)) {
				sanitized[key] = '***SENSITIVE***'
			} else if (typeof data[key] === 'object') {
				sanitized[key] = sanitizeData(data[key])
			} else {
				sanitized[key] = data[key]
			}
		}
	}
	return sanitized
}

/**
 * Generic log function that formats and emits debug logs.
 *
 * @param {string} component - Name of the component emitting the log.
 * @param {string} event - Type of event (e.g., 'init', 'handleClick', 'apiRequest').
 * @param {object} [data={}] - Additional data relevant to the event.
 */
const log = (component, event, data = {}) => {
	if (!isDebugMode()) return

	// eslint-disable-next-line no-console
	// console.log(`DEBUG_LOG :: ${component} :: ${event} :: ${new Date().toISOString()}`, JSON.stringify(sanitizeData(data)))
	loggingEvent.dispatchEvent(new CustomEvent('DEBUG', {
		detail: {
			component,
			event,
			data: sanitizeData(data),
		},
	}))
}

/**
 * Logs the initialization of a component.
 *
 * @param {string} componentName - Name of the component.
 * @param {object} props - Props received by the component.
 */
export const logComponentInit = (componentName, props) => {
	log(componentName, 'init', { props })
}

/**
 * Logs the invocation of an event handler.
 *
 * @param {string} componentName - Name of the component.
 * @param {string} handlerName - Name of the event handler.
 * @param {object} eventData - Data related to the event.
 */
export const logActionHandler = (componentName, handlerName, args) => {
	log(componentName, 'action', { handlerName, args })
}

/**
 * Logs the validation of an action.
 *
 * @param {string} componentName - Name of the component.
 * @param {string} handlerName - Name of the event handler.
 * @param {object} eventData - Data related to the validation.
 */
export const logValidateAction = (componentName, handlerName, args, isCorrect) => {
	log(componentName, 'validate-action', { handlerName, args, isCorrect })
}

/**
 * Logs an API request.
 *
 * @param {string} componentName - Name of the component making the API call.
 * @param {string} apiName - Identifier or endpoint of the API.
 * @param {object} requestData - Data sent with the API request.
 */
export const logApiRequest = (componentName, apiName, requestData) => {
	log(componentName, 'apiRequest', { apiName, requestData })
}

/**
 * Logs a successful API response.
 *
 * @param {string} componentName - Name of the component receiving the response.
 * @param {string} apiName - Identifier or endpoint of the API.
 * @param {object} responseData - Data received from the API.
 */
export const logApiResponse = (componentName, apiName, responseData) => {
	log(componentName, 'apiResponse', { apiName, responseData })
}

/**
 * Logs an API error.
 *
 * @param {string} componentName - Name of the component encountering the error.
 * @param {string} apiName - Identifier or endpoint of the API.
 * @param {Error|string} error - Error information.
 */
export const logApiError = (componentName, apiName, error) => {
	log(componentName, 'apiError', { apiName, error: getErrorMessage(error) })
}

/**
 * Logs any unhandled error.
 *
 * @param {string} componentName - Name of the component encountering the error.
 * @param {Error|string} error - Error information.
 * @param {string} stack - Stack trace of the error.
 */
export const logError = (componentName, error, stack) => {
	log(componentName, 'error', { error, stack })
}

/**
 * Logs the props passed to a component.
 *
 * @param {string} componentName - Name of the component receiving the props.
 * @param {object} props - Props received by the component.
 */
export const logProps = (componentName, props) => {
	log(componentName, 'props', props)
}

/**
 * Logs the state of a component.
 *
 * @param {string} componentName - Name of the component.
 * @param {object} state - State of the component.
 */
export const logState = (componentName, state) => {
	log(componentName, 'state', state)
}

/**
 * Logs custom events.
 *
 * @param {string} componentName - Name of the component emitting the log.
 * @param {string} eventName - Custom event name.
 * @param {object} eventData - Data related to the custom event.
 */
export const logCustomEvent = (componentName, eventName, eventData) => {
	log(componentName, eventName, eventData)
}
