'use strict'
import request from 'axios'
import _ from 'lodash'

export const all = (params) => {
	let token = ""
	let element = document.getElementsByName("csrf-token")[0]
	if (element) {
		token = element.content
	}
	let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
	params.params = _.extend(params.params || {}, { timezone: timeZone })
	params.data = params.data || {}

	const urlRoot = (params.urlRoot)
	const method = params.method
	const url = `${urlRoot}${params.path}`
	const responseType = 'json'
	const headers = {
		"Content-Type": "application/json",
		'Accept': 'application/json',
		"X-CSRF-Token": token
	}
	if (!_.isEmpty(params.headers)) {
		_.extend(headers, params.headers)
	}
	const requestParams = { method, url, responseType, headers, withCredentials: true }

	// `data` is the data to be sent as the request body
	// Only applicable for request methods 'PUT', 'POST', and 'PATCH'
	// When no `transformRequest` is set, must be a string, an ArrayBuffer or a hash
	if (params.data) requestParams.data = params.data

	// `param` are the URL parameters to be sent with the request
	if (params.params) requestParams.params = params.params
	return request(requestParams)
}

const createAPIParams = (controllerPath, path, method, params, data) => {
	return {
		urlRoot: controllerPath,
		path: path,
		method: method && method.toUpperCase() || 'GET',
		params,
		data
	}
}

const fileExplorersApi = (path = '', method = 'get', params = {}, data = {}) => {
	return all(createAPIParams('/api/v1/file_explorers', path, method, params, data))
}

export const createFileExplorer = (data) => {
	return fileExplorersApi('', 'post', null, data)
}

export const deleteFileExplorer = (id) => {
	return fileExplorersApi(`/${id}`, 'delete')
}

export const fetchFileExplorer = (id) => {
	return fileExplorersApi(`/${id}`)
}

export const updateFileExplorer = (id, data) => {
	return fileExplorersApi(`/${id}`, 'put', null, data)
}
