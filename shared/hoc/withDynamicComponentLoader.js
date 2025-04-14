import { loadComponents } from '@tests/shared/helpers/utils'
import React, { useEffect, useState } from 'react'

const CustomLoading = () => (
  <div className="p-4 text-center">
    Loading test environment...
  </div>
)

/**
 * HOC that dynamically loads components based on provided import definitions
 * @param {Object} componentImports - Object mapping component names to dynamic import functions
 * @param {Object} [options] - Additional options
 * @param {React.ComponentType} [options.LoadingComponent] - Component to show while loading
 */
const withDynamicComponentLoader = (componentImports, options = {}) => WrappedComponent => {
  const {
    LoadingComponent = CustomLoading
  } = options

  return function WithDynamicComponentLoader(props) {
    const [components, setComponents] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      const loadAllComponents = async () => {
        const loadedComponents = await loadComponents(componentImports)
        setComponents(loadedComponents)
        setIsLoading(false)
      }

      loadAllComponents()
    }, [])

    if (isLoading) {
      return <LoadingComponent />
    }

    return <WrappedComponent {...props} components={components} />
  }
}

export default withDynamicComponentLoader
