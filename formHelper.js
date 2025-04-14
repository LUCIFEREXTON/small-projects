import { logActionHandler } from "./logger"

function processElement(element, formData) {
	if (!element.name) return // Skip elements without a name

	let value
	switch (element.tagName) {
	case 'INPUT':
		switch (element.type) {
		case 'checkbox':
			value = element.checked
			break
		case 'radio':
			if (element.checked) {
				value = element.value
			}
			break
		case 'file':
			value = element.files[0].name // File input returns an array of files
			break
		default:
			value = element.value
		}
		break
	case 'SELECT':
	case 'TEXTAREA':
		value = element.value
		break
	default:
		return // Skip elements other than input, select, and textarea
	}

	const keys = element.name.split('[').map((key) => key.replace(']', ''))
	let obj = formData
	for (let j = 0; j < keys.length; j += 1) {
		let key = keys[j]
		const intKey = parseInt(key, 10)
		const isIndex = !Number.isNaN(intKey) && intKey >= 0
		key = isIndex ? intKey : key
		if (!obj[key]) {
			const possibleIndex = parseInt(keys[j + 1], 10)
			if (!Number.isNaN(possibleIndex) && possibleIndex >= 0) {
				obj[key] = []
			} else {
				obj[key] = {}
			}
		}
		if (j === keys.length - 1) {
			obj[key] = value
		} else {
			obj = obj[key]
		}
	}
}

export const getFormData = event => {
	event.preventDefault()
	const formData = {}
	const formElements = event.target.elements

	for (let i = 0; i < formElements.length; i += 1) {
		const element = formElements[i]
		if (
			(element.tagName === 'INPUT' && element.type !== 'button' && element.type !== 'submit' && element.type !== 'reset')
      || element.tagName === 'SELECT'
      || element.tagName === 'TEXTAREA'
		) {
			processElement(element, formData)
		}
  }

  logActionHandler('formHelper', 'getFormData', { event, formData })
	return formData
}

export const getParsedObjectData = (object) => {
	const parsedObject = {}

	const getFlatFields = (nestedObject, prefix = '') => {
		Object.keys(nestedObject).forEach((key) => {
			if (typeof nestedObject[key] === 'object') {
				getFlatFields(nestedObject[key], `${prefix}${key}.`)
			} else {
				parsedObject[`${prefix}${key}`] = nestedObject[key]
			}
		})
	}

	getFlatFields(object)

  logActionHandler('formHelper', 'getParsedObjectData', { object, parsedObject })
	return parsedObject
}

export const getParsedFormData = (formData) => {
	const parsedFormData = {}

	const getNestedFields = (flatObject) => {
		Object.keys(flatObject).forEach((key) => {
			const keys = key.split('.')
			const lastKey = keys.pop()
			let currentObject = parsedFormData

			keys.forEach((nestedKey) => {
				if (!currentObject[nestedKey]) {
					currentObject[nestedKey] = {}
				}
				currentObject = currentObject[nestedKey]
			})

			currentObject[lastKey] = flatObject[key]
		})
	}

	getNestedFields(formData)
	logActionHandler('formHelper', 'getParsedFormData', { formData, parsedFormData })
	return parsedFormData
}
