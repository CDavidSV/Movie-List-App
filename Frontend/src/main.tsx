import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { Route, BrowserRouter, Routes, useLocation, matchPath } from 'react-router-dom'
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

function App() {
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
        <Suspense>
          <Routes>
            <Route path="/" Component={Home}/>
            <Route path="/movies" Component={Movies}/>
            <Route path="/series" Component={Series}/>
            <Route path="/my-lists" Component={MyLists}/>
            <Route path="/genres/:genreName" Component={Genres}/>
            <Route path="/media/:type/:id" Component={Media}/>
            <Route path="/search" Component={Search}/>
            <Route path="/watchlist" Component={Watchlist}/>
            <Route path="/favorites" Component={Favorites}/>
            <Route path="/history" Component={History}/>
            <Route path="/profile" Component={MyProfile}/>
            <Route path="/login" Component={Login}/>
            <Route path="/signup" Component={SignUp}/>
            <Route path="*" Component={PageNotFound}/>
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <GlobalProvider>
        <MediaProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MediaProvider>
      </GlobalProvider>
    </ToastProvider>
  </React.StrictMode>,
)