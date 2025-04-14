import { sanitize as sanitizeHtml } from "dompurify"
import _ from "underscore"
import moment from "moment"

export const COVER_OPTION = {
	DEFAULT_COVER: 1,
	NO_COVER_PIC: 2,
	USER_COVER_PIC: 3,
}

export const LOGO_OPTION = {
	DEFAULT_LOGO: 1,
	NO_LOGO: 2,
	USER_LOGO: 3,
}

export const DEFAULT_IMAGE = {
	'plugin': '/assets/wp-plugin-icon.jpg',
	'theme': '/assets/wp-theme-icon.svg'
}

const getAbsoluteHeight = (el) => {
	el = (typeof el === "string") ? document.querySelector(el) : el
	const styles = window.getComputedStyle(el)
	const margin = parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"])

	return Math.ceil(el.offsetHeight + margin)
}

export const removePageBreak = (element) => {
	if (!element) return
	element.classList.remove("page-break-spacing")
	element.classList.remove("page-break-before-always")
}

const applyPageBreak = (element) => {
	if (!element) return
	element.classList.add("page-break-before-always")
	if (!(element.firstElementChild && element.firstElementChild.classList.contains("mt-15"))) {
		element.classList.add("page-break-spacing")
	}
}

export const assignPageBreaks = (mountedElement = document) => {
	const pageBreakElements = mountedElement.querySelectorAll(".page-break-element")
	if (_.isEmpty(pageBreakElements)) return
	const pageElements = Array.from(pageBreakElements)
	const userContent = mountedElement.getElementById("content") || {offsetHeight: 0}
	const dynamicContent = mountedElement.getElementById("dynamic-content") || {offsetHeight: 0}
	const contentSection = 1250
	const userContentHeight = getAbsoluteHeight(userContent)
	const dynamicContentHeight = getAbsoluteHeight(dynamicContent)
	const totalPageHeight = userContentHeight + dynamicContentHeight
	const pageCount = Math.ceil(totalPageHeight / contentSection)
	if (pageCount === 1) {
		pageElements.forEach((pageElement) => {
			removePageBreak(pageElement)
		})
		return
	}
	const lastPageUserContentHeight = userContentHeight % contentSection
	let lengthTillNow = lastPageUserContentHeight
	_.each(pageElements, (pageElement) => {
		if (!pageElement) return
		removePageBreak(pageElement)
		const pageElementHeight = getAbsoluteHeight(pageElement)
		if (pageElement.classList.contains('page-break-always')
			|| lengthTillNow + pageElementHeight > contentSection) {
			applyPageBreak(pageElement)
			lengthTillNow = pageElementHeight
		} else {
			lengthTillNow += pageElementHeight
		}
	})
}

export const sanitize = (string) => sanitizeHtml(string, {
	ALLOWED_TAGS: window.REPORT_ALLOWED_TAGS,
	ALLOWED_ATTR: window.REPORT_ALLOWED_ATTRIBUTES
})

export const getTranslatedText = (string, language, replacementObj) => {
	if (window.REPORT_DATA) {
		language = window.REPORT_DATA.language
	}
	const languageHash = window.REPORT_LANGUAGE_TOKENS[language]
	const sig = window.REPORT_TRANSLATION_SIGNATURE
	const token = `${sig}${string}${sig}`
	const replacementKeys = Object.keys(replacementObj || {})
	let translatedString = languageHash[token] || string
	if (replacementKeys.length) {
		replacementKeys.forEach((key) => {
			translatedString = translatedString.replace(`%{${key}}`, replacementObj[key])
		})
	}
	return translatedString
}

export const timeoutImages = (imageClass) => {
	setTimeout(() => {
		const imgs = document.getElementsByClassName(`${imageClass}s`)
		for (let i = 0; i < imgs.length; i++) {
			if (!imgs[i].complete) {
				imgs[i].src = DEFAULT_IMAGE[imageClass]
			}
		}
	}, 10000)
}

export const numberToHumanSize = (size, precision = 2) => {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

	if (size === 0) return `0 Byte`

	const i = parseInt(Math.floor(Math.log(size) / Math.log(1024)))
	const formattedSize = (size / Math.pow(1024, i)).toFixed(precision)
	return `${formattedSize} ${sizes[i]}`
}

export const getImage = (image, mime_type) => {
	if (typeof image === "string") {
		return `data:image/${mime_type};base64, ${image}`
	} else if (typeof image === "object" && image instanceof Blob) {
		return URL.createObjectURL(image)
	}
}

export const convertMillisecondsToDHM = (milliseconds) => {
	const formattedTime = []

	const duration = moment.duration(milliseconds)
	const days = Math.floor(duration.asDays())
	const hours = duration.hours()
	const minutes = duration.minutes()

	if (minutes === 59 && hours === 23 && days === 0)
		return '24h'

	if (days > 0) {
		formattedTime.push(`${days}d`)
	}

	if (hours > 0) {
		formattedTime.push(`${hours}h`)
	}

	if (formattedTime.length === 0 || (minutes > 0 && formattedTime.length < 2)) {
		formattedTime.push(`${minutes}m`)
	}

	return formattedTime.join(' ')
}

const hexToRgb = (hex) => {
	hex = (hex || '').replace(/^#/, '')
	const bigint = parseInt(hex, 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255
	return [r, g, b]
}

export const getColor = (value, primaryColor, max) => {
	const startColor = [236, 243, 254]
	const endColor = hexToRgb(primaryColor)
	const ratio = Math.min(Math.max(value / max, 0), 1)
	const newColor = startColor.map((start, i) => Math.round(start * (1 - ratio) + endColor[i] * ratio))
	return `#${  newColor.map(c => c.toString(16).padStart(2, '0')).join('')}`
}

export const numShorter = (num) => {
	const BILLION = 1000000000
	const MILLION = 1000000
	const THOUSAND = 1000

	if (num > BILLION) {
		return `${Math.floor(num / BILLION)}B+`
	} else if (num > MILLION) {
		return `${Math.floor(num / MILLION)}M+`
	} else if (num > THOUSAND) {
		return `${Math.floor(num / THOUSAND)}K+`
	} else {
		return `${num}`
	}
}
