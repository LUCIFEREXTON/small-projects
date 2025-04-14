/**
 * Safely imports a component with error handling
 * @param {Function} importFn - Import function to call
 * @param {string} name - Component name for debugging
 * @returns {Component|null} - The imported component or fallback
 */
export const safeImport = async (importFn, name) => {
	try {
		if (importFn && typeof importFn === 'object' &&
      (importFn._status !== undefined ||
        (importFn.$$typeof && importFn._payload))) {
			return importFn
		} else if (typeof importFn === 'function') {
			const module = await importFn()
			return module.default
		} else {
			console.debug(`Module type details:`, {
				type: typeof importFn,
				isNull: importFn === null,
				isUndefined: importFn === undefined,
				hasProperties: importFn ? Object.keys(importFn) : []
			})
			return () => <div>Component {name} is not available</div>
		}
	} catch (error) {
		console.warn(`Module ${name} could not be loaded:`, error.message)
		return () => <div>Component {name} is not available</div>
	}
}

/**
 * Safely renders a component with error handling
 * @param {Component} component - Component to render
 * @param {JSX.Element} fallback - Fallback UI when component is missing
 * @param {Object} props - Props to pass to the component
 * @returns {JSX.Element} - Rendered component or fallback
 */
export const SafeComponent = ({ component: Component, fallback, ...props }) => {
	if (!Component) return fallback || <div>Component is not available</div>

	try {
		return <Component {...props} />
	} catch (error) {
		console.error("Error rendering component:", error)
		return fallback || <div>Failed to render component</div>
	}
}

/**
 * Loads multiple components dynamically with error handling
 * @param {Object} componentImports - Map of component names to import functions
 * @returns {Promise<Object>} - Object containing all loaded components
 */
export const loadComponents = async (componentImports) => {
	const loadedComponents = {}

	for (const [name, importFn] of Object.entries(componentImports)) {
		loadedComponents[name] = await safeImport(importFn, name)
	}

	return loadedComponents
}
