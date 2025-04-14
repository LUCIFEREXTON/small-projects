import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import App from "../fileExplorer/App"

document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(<BrowserRouter>
		<StrictMode>
			<Switch>
				<Route path={`/${window.root_url}/:id`} component={App} />
				<Route path={`/${window.root_url}`} component={App} />
			</Switch>
		</StrictMode>
	</BrowserRouter>,
	document.body.appendChild(document.createElement('div')))
})
