import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { SafeComponent } from '@tests/shared/helpers/utils'

function RenderRoutes({ routes, noBack }) {
  return (
    <div className="flex flex-col">
      <Routes>
        <Route
          path=""
          element={(
            <ul className="list-none p-0">
              {noBack ? null : (
                <li className="py-2">
                  <Link to=".." className="text-blue-600 hover:text-blue-800 hover:underline">
                    Back
                  </Link>
                </li>
              )}
              {routes.map((route) => (
                <li key={route.label} className="py-2">
                  <Link to={route.to || route.path} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        />

        {routes.map((route) => (
          <Route
            path={`${route.path}/*`}
            key={route.path}
            element={
              <SafeComponent
                component={route.Component}
                fallback={<div>The component for `{route.label}` is not available</div>}
              />
            }
          />
        ))}
      </Routes>
    </div>
  )
}

export default RenderRoutes
