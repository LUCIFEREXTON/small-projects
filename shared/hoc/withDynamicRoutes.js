import withDynamicComponentLoader from '@tests/shared/hoc/withDynamicComponentLoader'
import { useMemo } from 'react'

/**
 * HOC that transforms component definitions into route configurations
 * @param {Object[]} routeDefinitions - Array of route definition objects
 * @param {string} routeDefinitions[].path - Route path
 * @param {string} routeDefinitions[].LazyComponent - Key of the component in the components object
 * @param {string} routeDefinitions[].label - Display label for the route
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.filterInvalidRoutes=true] - Whether to filter out routes with missing components
 */
const withDynamicRoutes = (routeDefinitions, options = {}) => WrappedComponent => {
	const {
		filterInvalidRoutes = true,
		LoadingComponent
	} = options

	const componentImports = routeDefinitions.reduce((acc, { path, LazyComponent }) => {
		acc[path] = LazyComponent
		return acc
	}, {})

	const RoutesComponent = ({ components, ...props }) => {
		const routes = useMemo(() => {
			let routeConfig = routeDefinitions.map(({ path, label, ...rest }) => ({
				path,
				Component: components[path],
				label,
				...rest
			}))

			if (filterInvalidRoutes) {
				routeConfig = routeConfig.filter(route => route.Component)
			}

			return routeConfig
		}, [components])

		return <WrappedComponent {...props} routes={routes} />
	}

	return withDynamicComponentLoader(componentImports, { LoadingComponent })(RoutesComponent)
}

export default withDynamicRoutes
