import React, { Suspense, lazy, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { matchPath, createBrowserRouter, RouterProvider, useLocation, Outlet, Navigate } from 'react-router-dom'
import Navbar from './components/navbar-component/navbar'
import Header from './components/header-component/header';
import Footer from './components/footer-component/footer';
import GlobalProvider, { GlobalContext } from './contexts/GlobalContext';
import MediaProvider from './contexts/MediaContext';
import { ToastProvider } from './contexts/ToastContext';
import "./index.css";

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
const Error = lazy(() => import('./pages/Error/Error'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const Media = lazy(() => import('./pages/Media/Media'));
const UserPage = lazy(() => import('./pages/UserPage/UserPage'));
const SearchUsers = lazy(() => import('./pages/SearchUsers/SearchUsers'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loggedIn } = useContext(GlobalContext);

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function PageWrapper() {
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
    "/media/:type/:id",
    "/user/:username",
    "/search-users"
  ];

  const shouldShowNavbar = showNavIn.some((path: string) => {
    return matchPath(path, location.pathname);
  });

  return (
    <div className="main-page-container">
      <div className="main-content-wrap">
        {shouldShowNavbar ? <Navbar/> : <Header/>}
        <Suspense>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      element: <PageWrapper />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/movies',
          element: <Movies />,
        },
        {
          path: '/series',
          element: <Series />,
        },
        {
          path: '/my-lists',
          element: <MyLists />,
        },
        {
          path: '/genres/:genreName',
          element: <Genres />,
        },
        {
          path: '/search',
          element: <Search />,
        },
        {
          path: '/watchlist',
          element: <Watchlist />,
        },
        {
          path: '/history',
          element: <History />,
        },
        {
          path: '/profile',
          element: <MyProfile />,
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/signup',
          element: <SignUp />,
        },
        {
          path: '/favorites',
          element: <Favorites />,
        },
        {
          path: '/media/:type/:id',
          element: <Media />,
        },
        {
          path: '/user/:username',
          element:<ProtectedRoute><UserPage /></ProtectedRoute>,
        },
        {
          path: '/search-users',
          element: <ProtectedRoute><SearchUsers /></ProtectedRoute>,
        }
      ],
      errorElement: <>
        <Header/>
        <Error />
      </>
    },
    {
      path: '*',
      element: <>
        <Header/>
        <PageNotFound />
      </>
    }
  ]);

  return (
    <RouterProvider router={router} />
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