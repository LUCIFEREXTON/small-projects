import { useCallback, useEffect, useMemo, useRef } from 'react'
import useUrlParams from './useUrlParams'
import { debounce } from '@shared/helpers/functionHelper'

export const useTabs = (tabs, tabRefs, key = 'tab') => {
	const [urlParams, setUrlParams] = useUrlParams({
		[key]: tabs[0]?.value || ''
	})
	const activeTab = urlParams[key] || (tabs[0]?.value || '')
	const observerLockRef = useRef(true)

	const setActiveTab = useCallback((tabValue) => {
		setUrlParams(key, tabValue)
	}, [setUrlParams, key])

	const observerSetActiveTab = useCallback((_activeTab) => {
		if (observerLockRef.current) {
			return
		}
		setActiveTab(_activeTab)
	}, [setActiveTab])


	const debouncedSetActiveTab = useMemo(() => debounce(observerSetActiveTab, 100, key), [observerSetActiveTab, key])

	const handleClick = useCallback((tabValue) => {
		observerLockRef.current = true
		const tabIndex = tabs.findIndex(tab => tab.value === tabValue)
		if (tabIndex !== -1 && tabRefs[tabIndex]?.current) {
			tabRefs[tabIndex].current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
			tabRefs[tabIndex].current.classList.add('rounded-md', 'transition-all', 'bg-emerald-50')

			setTimeout(() => {
				tabRefs[tabIndex].current.classList.remove('rounded-md', 'transition-all', 'bg-emerald-50')
				observerLockRef.current = false
			}, 1000)

			setActiveTab(tabValue)
		}
	}, [setActiveTab])

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && entry.intersectionRatio < 0.6 && entry.intersectionRatio > 0.5) {
					const tabValue = entry.target.getAttribute('data-tab')
					debouncedSetActiveTab(tabValue)
				}
			})
		}, {
			threshold: 0.5,
			rootMargin: '0px',
		})

		tabRefs.forEach((tabRef) => {
			if (tabRef.current) {
				observer.observe(tabRef.current)
			}
		})

		return () => {
			tabRefs.forEach((tabRef) => {
				if (tabRef.current) {
					observer.unobserve(tabRef.current)
				}
			})
		}
	}, [tabRefs, debouncedSetActiveTab])

	useEffect(() => {
		observerLockRef.current = true
		const tabIndex = tabs.findIndex((tab) => tab.value === activeTab)
		if (tabIndex !== -1) {
			tabRefs[tabIndex].current.scrollIntoView({ block: 'nearest' })
			tabRefs[tabIndex].current.classList.add('rounded-md', 'transition-all', 'bg-emerald-50')

			setTimeout(() => {
				tabRefs[tabIndex].current.classList.remove('rounded-md', 'transition-all', 'bg-emerald-50')
				observerLockRef.current = false
			}, 1000)
		}
	}, [...tabRefs])

	return {
		activeTab,
		handleTabClick: handleClick,
	}
}
