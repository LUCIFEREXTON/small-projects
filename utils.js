import _, { difference, isArray, isEqual, keys, reduce } from 'lodash'
import moment from 'moment'
//import DOMPurify from 'dompurify'

export const contactUrl = () => {
	let url
	switch (window.servicename) {
	case 'malcare':
		url = 'https://www.malcare.com/contact/?src=nocard'
		break
	case 'wpremote':
		url = 'https://app.wpremote.com/contact'
		break
	default:
		url = 'https://www.blogvault.net/contact/?src=nocard'
	}
	return url
}

export const getErrorMessage = (error) => (_.get(error, 'response.data.errors') || error.message)

let timeoutHash = {}

export function debounce(func, delay, id) {
	if (!id) throw 'Debounce function requires an id'
	return function (...args) {
		const context = this
		clearTimeout(timeoutHash[id])
		timeoutHash[id] = setTimeout(() => func.apply(context, args), delay)
	}
}

export const URL_REGEX = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$/

export const validateURL = (url) => {
	if (!url) return "URL is required"
	if (!URL_REGEX.test(url)) {
		return "Invalid URL format"
	}
	return ""
}

export const humanReadableByteCount = (bytes) => {
	let unit = 1024
	if (bytes < unit)
		return `${bytes} Bytes`
	let exp = Math.floor((Math.log(bytes) / Math.log(unit)))
	let order = ` ${"KMGTPE".charAt(exp - 1)}B`
	return (bytes / Math.pow(unit, exp)).toFixed(2) + order
}

export const parseDateWithMoment = (value) => {
	if (!value) return undefined

	const m = moment(value)
	return m.isValid() ? m.toDate() : undefined
}

export const goodValue = (value) => value !== undefined && value !== null

export const cleanObject = (filters) => {
	const cleanedObject = {}
	Object.entries(filters || {}).forEach(([key, value]) => {
		if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
			const nested = cleanObject(value)
			cleanedObject[key] = nested
		} else if (goodValue(value)) {
			cleanedObject[key] = value
		}
	})
	return cleanedObject
}
export const sanitizeHTML = (dirtyHtml) => {
	return dirtyHtml
}

export const updateOnlyIfChanged = (current, incoming) => {
	if (isEqual(current, incoming)) return current
	if (typeof incoming === 'object' && incoming !== null) {
		if (isArray(incoming)) {
			return incoming.map(item => updateOnlyIfChanged(current, item))
		}
		const updatedObject = reduce(incoming, (result, value, key) => {
			current[key] = updateOnlyIfChanged(current[key], value)
			return result
		}, current)
		if (difference(keys(updatedObject), keys(current)).length > 0) {
			return { ...updatedObject }
		}
		let isAnyValueChanged
		for (const key in updatedObject) {
			if (updatedObject[key] !== current[key]) {
				isAnyValueChanged = true
				break
			}
		}
		return isAnyValueChanged ? { ...updatedObject } : updatedObject
	}
	return incoming
}
