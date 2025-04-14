import { SafeComponent } from '@tests/shared/helpers/utils'
import { Link, Route, Routes } from 'react-router-dom'

function RenderRoutes({ title, routes, noBack }) {
  return (
    <div className="flex flex-col">
      <Routes>
        <Route
          path=""
          element={(
            <ul className="py-2">
              {noBack ? null : (
                <li className="px-4 py-2">
                  <Link to=".." className="text-blue-600 hover:text-blue-800 hover:underline">
                    Back
                  </Link>
                </li>
              )}
              {title && <h3 className="text-lg font-semibold text-gray-900 px-4 sm:px-6 lg:px-8 py-4">
                {title}
              </h3>}
              {routes.map((route) => (
                <li key={route.label} className="px-4 py-2">
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
              <div className="flex flex-col">
                <Link to=".." className="text-emerald-700 underline mb-4">
                  Back
                </Link>
                <SafeComponent
                  component={route.Component}
                  fallback={<div>The component for `{route.label}` is not available</div>}
                />
              </div>
            }
          />
        ))}
      </Routes>
    </div>
  )
}

export default RenderRoutes
