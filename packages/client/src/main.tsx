import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  Outlet,
  RouterProvider,
  Router,
  Route,
  RootRoute,
} from '@tanstack/react-router'
import {
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query'


const queryClient = new QueryClient()

const Login = React.lazy(() => import('./routes/registration/Login'))
const Home = React.lazy(() => import('./routes/Home'))
const Channel = React.lazy(() => import('./routes/Channel'))

const rootRoute = new RootRoute({
    component: () => (
        <>
            <Outlet />
        </>
    ),
})

const loginRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "login",
    component: () => <Suspense><Login /></Suspense>
})

const channelsRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "channels"
})

const homeRoute = new Route({
    getParentRoute: () => channelsRoute,
    path: "@me",
    component: () => <Suspense><Home /></Suspense>
})

const channelRoute = new Route({
    getParentRoute: () => channelsRoute,
    path: "$channelId",
    component: () => <Suspense><Channel /></Suspense>
})

const routeTree = rootRoute.addChildren([loginRoute, channelsRoute.addChildren([homeRoute, channelRoute])])

const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>,
)
