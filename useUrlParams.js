import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const goodValue = (value) => value !== undefined && value !== null

// Recursively remove unused filters, including in nested objects
const removeUnusedFilters = (filters) => {
  const usedFilters = {}
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const nested = removeUnusedFilters(value) // Recursively clean nested objects
      usedFilters[key] = nested
    } else if (goodValue(value)) {
      usedFilters[key] = value
    }
  })
  return usedFilters
}

// Convert URLSearchParams to a nested object
const parseParams = (searchParams) => {
  const params = {}

  for (const [key, value] of searchParams.entries()) {
    const keys = key.split('.') // Assumes dot notation for nested params (e.g., 'filter.category')
    let current = params

    while (keys.length > 1) {
      const nestedKey = keys.shift()
      if (!current[nestedKey]) {
        current[nestedKey] = {}
      }
      current = current[nestedKey]
    }

    const finalKey = keys[0]
    if (finalKey.endsWith('__obj') && value === 'empty') {
      // Handle special case for empty objects
      const realKey = finalKey.replace(/__obj$/, '')
      current[realKey] = current[realKey] || {}
    } else if (value.startsWith('a:[') && value.endsWith(']')) {
      // Handle arrays
      const contentStr = value.slice(3, -1)
      const arrayContent = contentStr ? contentStr.split(',') : []
      current[finalKey] = arrayContent.map((item) => {
        const [type, originalValue] = item.split(':')
        switch (type) {
          case 'n': // Number
            return parseFloat(originalValue)
          case 'b': // Boolean
            return originalValue === 'true'
          case 's': // String
          default:
            return originalValue
        }
      })
    } else {
      // Decode scalar value with type annotation
      const [type, originalValue] = value.split(':')
      let parsedValue

      switch (type) {
        case 'n': // Number
          parsedValue = parseFloat(originalValue)
          break
        case 'b': // Boolean
          parsedValue = originalValue === 'true'
          break
        case 's': // String
        default:
          parsedValue = originalValue
          break
      }

      current[finalKey] = parsedValue
    }
  }

  return params
}




// Convert nested objects to URLSearchParams
const stringifyParams = (obj, parentKey = '') => {
  const params = new URLSearchParams()

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key

    if (Array.isArray(value)) {
      // Handle arrays, encode each element with its type
      const annotatedArray = value.map((item) => {
        if (typeof item === 'number') return `n:${item}`
        if (typeof item === 'boolean') return `b:${item}`
        return `s:${item}` // Default to string
      })
      params.set(fullKey, `a:[${annotatedArray.join(',')}]`)
    } else if (typeof value === 'object' && value !== null) {
      if (Object.keys(value).length === 0) {
        // Mark empty objects explicitly
        params.set(`${fullKey}__obj`, 'empty')
      } else {
        const nestedParams = stringifyParams(value, fullKey)
        nestedParams.forEach((val, nestedKey) => {
          params.append(nestedKey, val)
        })
      }
    } else if (goodValue(value)) {
      // Annotate scalar values with their types
      let annotatedValue
      if (typeof value === 'number') {
        annotatedValue = `n:${value}`
      } else if (typeof value === 'boolean') {
        annotatedValue = `b:${value}`
      } else {
        annotatedValue = `s:${value}` // Default to string
      }
      params.set(fullKey, annotatedValue)
    }
  })

  return params
}



const useUrlParams = (initialParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams(stringifyParams(initialParams))
  const params = useMemo(() => parseParams(searchParams), [searchParams])

  const setParams = useCallback((arg1, arg2) => {
    if (typeof arg1 === 'function') {
      setSearchParams((prevParams) => stringifyParams(removeUnusedFilters(arg1(parseParams(prevParams)))))
    } else if (typeof arg1 === 'object') {
      setSearchParams(stringifyParams(removeUnusedFilters(arg1)))
    } else if (typeof arg1 === 'string') {
      const key = arg1
      const value = arg2
      setSearchParams((prevParams) => {
        const newParams = parseParams(prevParams)
        if (goodValue(value)) {
          newParams[key] = value
        } else {
          delete newParams[key]
        }
        return stringifyParams(newParams)
      })
    }
  }, [setSearchParams])

  return [params, setParams]
}

export default useUrlParams
