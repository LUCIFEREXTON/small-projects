import request from 'axios'
import _ from 'lodash'

export const all = (params, requestOptions = {}) => {
  let token = ''
  const element = document.getElementsByName('csrf-token')[0]
  if (element) {
    token = element.content
  }
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions()
  params.params = _.extend(params.params || {}, {
    newui: true,
    account_gid: window.account_gid,
    migration: window.migration,
    timezone: timeZone,
  })
  params.data = _.extend(params.data || {}, {
    newui: true,
    account_gid: window.account_gid,
    migration: window.migration,
  })

  const urlRoot = params.urlRoot || 'http://localhost:3000'
  const path = params.path || ''
  const { method } = params
  const url = `${urlRoot}${path}`
  const responseType = 'json'
  const headers = {
		//   'X-CSRF-Token': token,
  }
  if (!_.isEmpty(params.headers)) {
    _.extend(headers, params.headers)
  }
  const requestParams = {
    method, url, responseType, headers
  }
  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
  // When no `transformRequest` is set, must be a string, an ArrayBuffer or a hash
  if (params.data) requestParams.data = params.data

  // `param` are the URL parameters to be sent with the request
  if (params.params) requestParams.params = params.params

  return request(_.extend(requestParams, requestOptions))
}

const apiCall = {}
const paramsSupportedMethods = ['GET', 'DELETE']
const dataSupportedMethods = ['POST', 'PUT', 'PATCH']
const supportedMethods = [...paramsSupportedMethods, ...dataSupportedMethods]
supportedMethods.forEach(
  (method) => (apiCall[method.toLowerCase()] = (options, requestOptions = {}) => {
    const finalOptions = { ...options, method }
    if (paramsSupportedMethods.includes(method) && finalOptions.data) {
      finalOptions.params = finalOptions.data
      delete finalOptions.data
    } else if (dataSupportedMethods.includes(method) && finalOptions.params) {
      finalOptions.data = finalOptions.params
      delete finalOptions.params
    }
    return all(finalOptions, requestOptions)
  })
)

export default apiCall
