import React, { createContext, useContext, useMemo, useReducer } from 'react'
import { generateId } from '../utils/fileSystemUtils'

const AppContext = createContext()

export const initialState = {
	toastMessages: [],
}

const dispatches = {
	addToastMessage: (state, { payload }) => {
		const id = generateId()
		payload.id = id
		return {
			...state,
			toastMessages: [...state.toastMessages, payload],
		}
	},
	removeToastMessage: (state, { payload }) => {
		return {
			...state,
			toastMessages: state.toastMessages.filter(message => message.id !== (payload?.id || payload)),
		}
	}
}

const reducer = (state, action) => {
	const dispatch = dispatches[action.type]
	if (!dispatch) {
		throw new Error(`Action type "${action.type}" not found in AppContext`)
	}
	return dispatch(state, action)
}

export const dispatchNames = Object.keys(dispatches)


export const AppProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	const dispatchers = useMemo(() => Object.freeze(Object.keys(dispatches).reduce((acc, key) => {
		acc[key] = (payload) => dispatch({ type: key, payload })
		return acc
	}, {})), [dispatch])

	return <AppContext.Provider value={{ state, dispatchers }}>
		{children}
	</AppContext.Provider>
}

export const useAppContext = () => {
	const context = useContext(AppContext)
	if (!context) {
		throw new Error('useAppContext must be used within an AppProvider')
	}
	return context
}

export const useAppContextState = (path = '') => {
	const { state } = useAppContext()
	return path ? state[path] : state
}

export const useAppContextDispatch = (dispatch = '') => {
	const { dispatchers } = useAppContext()
	return dispatch ? dispatchers[dispatch] : dispatchers
}
