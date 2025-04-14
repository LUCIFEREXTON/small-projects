import { useState, useEffect } from 'react'
import moment from 'moment'

const RelativeTime = ({ time, options = {} }) => {
	const [relativeTime, setRelativeTime] = useState('')
	const inShortForm = options.shortForm || false

	function shortenUnits(relativeTimeString) {
		return relativeTimeString
			.replace(/\b(\d+)\ssecond(s)?\b/g, '$1s')
			.replace(/\b(\d+)\sminute(s)?\b/g, '$1m')
			.replace(/\b(\d+)\shour(s)?\b/g, '$1h')
			.replace(/\b(\d+)\sday(s)?\b/g, '$1d')
			.replace(/\b(\d+)\sweek(s)?\b/g, '$1w')
			.replace(/\b(\d+)\smonth(s)?\b/g, '$1mo')
			.replace(/\b(\d+)\syear(s)?\b/g, '$1y')
	}

	useEffect(() => {
		setRelativeTime(moment(time).fromNow())
	}, [time])

	return inShortForm ? shortenUnits(relativeTime) : relativeTime
}

export default RelativeTime
