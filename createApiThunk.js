import { clearUpdatedAtByPrefix, getUpdatedAt, setUpdatedAt } from '@app/redux/slices/apiUpdatedAt'
import { clearCacheByPrefix, getCacheItem, setCacheItem } from '@app/redux/slices/cache'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { logApiError, logApiRequest, logApiResponse } from '@shared/helpers/logger'
import axios from 'axios'
import _ from 'lodash'

const DEFAULT_CACHE_DURATION = 60 // 60 seconds

const createApiThunk = (sliceName, name, apiCallFunc, successActions = [], options = {}) => {
  return createAsyncThunk(
    `${sliceName}/${name}`,
    async (arg, { dispatch, getState, rejectWithValue, signal }) => {
      const { args, options: callOptions = {} } = typeof arg === 'object' && arg !== null ? arg : { args: arg, options: {} }
      const {
        cacheDuration = DEFAULT_CACHE_DURATION,
        abortRequest = false,
        forceCall
      } = callOptions
      const requestOptions = {}

      if (abortRequest) {
        const source = axios.CancelToken.source()
        signal.addEventListener('abort', () => {
          source.cancel()
        })
        requestOptions.cancelToken = source.token
      }

      const cacheKey = `${sliceName}/${name}-${JSON.stringify(args)}`

      if (options.canUseUpdatedAt) {
        const lastUpdatedAt = getUpdatedAt(getState(), cacheKey)
        if (lastUpdatedAt) {
          args.updated_at = lastUpdatedAt
        }
      }

      if (options.canUseCache && !forceCall) {
        const cachedData = getCacheItem(getState(), cacheKey)
        if (cachedData) {
          return { data: cachedData }
        }
      }

      try {
        logApiRequest(sliceName, name, { args, requestOptions })

        const response = await apiCallFunc(args)
        const { data } = response

        if (options.flushCache) {
          dispatch(clearCacheByPrefix(`${sliceName}/`))
          if (options.canUseUpdatedAt) {
            dispatch(clearUpdatedAtByPrefix(`${sliceName}/`))
          }
        }

        if (options.canUseUpdatedAt && data.updated_at) {
          const updatedAt = new Date(data.updated_at).toISOString()
          dispatch(setUpdatedAt({ key: cacheKey, updatedAt }))
        }

        if (!_.isEmpty(successActions)) {
          successActions.forEach((action) => {
            dispatch(action(data))
          })
        }

        if (options.canUseCache) {
          dispatch(setCacheItem({ key: cacheKey, data, duration: cacheDuration }))
        }

        logApiResponse(sliceName, name, data)
        return {
          data: data,
        }
      } catch (err) {
        logApiError(sliceName, name, err)
        return rejectWithValue(err)
      }
    }
  )
}

export default createApiThunk
