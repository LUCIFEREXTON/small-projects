import { BvCard, BvCardContent, BvCardHeader, BvButton } from "@shared/components"
import { useEffect, useRef, useState, useCallback } from "react"
import ShowJsObject from "./ShowJsObject"

export default function PassedProps({ passedProps = {} }) {
	const [changedProps, setChangedProps] = useState({})
	const [copied, setCopied] = useState(false)
	const prevPropsRef = useRef({})

	const handleCopyAll = useCallback(() => {
		navigator.clipboard.writeText(JSON.stringify(passedProps, null, 2))
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 5000)
			})
	}, [passedProps])

	useEffect(() => {
		if (Object.keys(passedProps).length && Object.keys(prevPropsRef.current).length) {
			const newChangedProps = {}

			// For each component in passedProps
			Object.entries(passedProps).forEach(([componentName, props]) => {
				const previousProps = prevPropsRef.current[componentName]

				if (previousProps && props) {
					// Initialize component in changedProps if not exists
					if (!newChangedProps[componentName]) {
						newChangedProps[componentName] = {}
					}

					// For each prop in current component, check if it has changed
					Object.keys(props).forEach(propKey => {
						if (JSON.stringify(props[propKey]) !== JSON.stringify(previousProps[propKey])) {
							newChangedProps[componentName][propKey] = true
						}
					})

					// Remove component entry if no props changed
					if (Object.keys(newChangedProps[componentName]).length === 0) {
						delete newChangedProps[componentName]
					}
				}
			})

			// If we detected changes, set them and clear after a delay
			if (Object.keys(newChangedProps).length > 0) {
				setChangedProps(newChangedProps)
				const timer = setTimeout(() => {
					setChangedProps({})
				}, 2000)
				return () => clearTimeout(timer)
			}
		}

		prevPropsRef.current = passedProps
	}, [passedProps])

	if (!passedProps || Object.keys(passedProps).length === 0) {
		return null
	}

	const componentCount = Object.keys(passedProps).length

	return (
		<div className="p-4">
			<BvCard variant="neutral">
				<BvCardHeader
					title="Passed Props"
					subTitleVariant="muted"
					subTitle={`${componentCount} component${componentCount !== 1 ? 's' : ''}`}
					secondarySection={
						<BvButton
							variant="icon"
							size="sm"
							startIcon={copied ? "check" : "clipboard-copy"}
							onClick={handleCopyAll}
							title={copied ? "Copied!" : "Copy all props"}
						/>
					}
				/>
				<BvCardContent>
					<div className="flex flex-col gap-6">
						{Object.entries(passedProps).map(([componentName, props], index) => (
							<div key={componentName} className="border-t pt-4 first:border-t-0 first:pt-0">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-sm font-semibold text-blue-600">{componentName}</span>
								</div>

								{props && Object.keys(props).length > 0 ? (
									<ShowJsObject
										data={props}
										highlightedKeys={changedProps[componentName] || {}}
									/>
								) : (
									<div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">
                    No props passed
									</div>
								)}
							</div>
						))}
					</div>
				</BvCardContent>
			</BvCard>
		</div>
	)
}
