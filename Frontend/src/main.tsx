import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { matchPath, createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom'
import Navbar from './components/navbar-component/navbar'
import Header from './components/header-component/header';
import Footer from './components/footer-component/footer';
import GlobalProvider from './contexts/GlobalContext';
import MediaProvider from './contexts/MediaContext';
import "./index.css";
import { ToastProvider } from './contexts/ToastContext';

const Home = lazy(() => import('./pages/Home/Home'));
const Movies = lazy(() => import('./pages/Movies/Movies'));
const Series = lazy(() => import('./pages/Shows/Series'));
const MyLists = lazy(() => import('./pages/MyLists/MyLists'));
const Genres = lazy(() => import('./pages/Genres/Genres'));
const Search = lazy(() => import('./pages/Search/Search'));
const Watchlist = lazy(() => import('./pages/Watchlists/Watchlist'));
const History = lazy(() => import('./pages/History/History'));
const MyProfile = lazy(() => import('./pages/MyProfile/MyProfile'));
const Login = lazy(() => import('./pages/Login/Login'));
const SignUp = lazy(() => import('./pages/Signup/Signup'));
const PageNotFound = lazy(() => import('./pages/PageNotFound/PageNotFound'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const Media = lazy(() => import('./pages/Media/Media'));

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showNavIn: string[] = [
    "/", 
    "/movies", 
    "/series", 
    "/my-lists", 
    "/genres/:genreName", 
    "/search", 
    "/watchlist", 
    "/history", 
    "/profile", 
    "/favorites",
    "/media/:type/:id"
  ];

  const shouldShowNavbar = showNavIn.some((path: string) => {
    return matchPath(path, location.pathname);
  });

  return (
    <div className="main-page-container">
      <div className="main-content-wrap">
        {shouldShowNavbar ? <Navbar/> : <Header/>}
        {children}
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <PageWrapper><Home /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/movies',
      element: <PageWrapper><Movies /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/series',
      element: <PageWrapper><Series /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/my-lists',
      element: <PageWrapper><MyLists /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/genres',
      element: <PageWrapper><Genres /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/search',
      element: <PageWrapper><Search /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/watchlist',
      element: <PageWrapper><Watchlist /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/history',
      element: <PageWrapper><History /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/profile',
      element: <PageWrapper><MyProfile /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/login',
      element: <PageWrapper><Login /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/signup',
      element: <PageWrapper><SignUp /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/favorites',
      element: <PageWrapper><Favorites /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '/media/:type/:id',
      element: <PageWrapper><Media /></PageWrapper>,
      errorElement: <PageNotFound />
    },
    {
      path: '*',
      element: <PageNotFound />
    }
  ]);

  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <GlobalProvider>
        <MediaProvider>
          <App />
        </MediaProvider>
      </GlobalProvider>
    </ToastProvider>
  </React.StrictMode>,
)