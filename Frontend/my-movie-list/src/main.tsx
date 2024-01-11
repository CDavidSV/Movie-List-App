import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { Route, BrowserRouter, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/navbar-component/navbar'
import Header from './components/header-component/header';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const Shows = lazy(() => import('./pages/Shows'));
const MyLists = lazy(() => import('./pages/MyLists'));
const Genres = lazy(() => import('./pages/Genres'));
const Search = lazy(() => import('./pages/Search'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const History = lazy(() => import('./pages/History'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/Signup'));
const PageNotFound = lazy(() => import('./pages/NotFound'));
const Favorites = lazy(() => import('./pages/Favorites'));

function App() {
  const location = useLocation();
  const showNavIn: string[] = ["/", "/movies", "/shows", "/my-lists", "/genres", "/search", "/watchlist", "/history", "/profile", "/favorites"];

  return (
    <>
      {showNavIn.includes(location.pathname) ? <Navbar/> : <Header/>}
      <Suspense>
        <Routes>
          <Route path="/" Component={Home}/>
          <Route path="/movies" Component={Movies}/>
          <Route path="/shows" Component={Shows}/>
          <Route path="/my-lists" Component={MyLists}/>
          <Route path="/genres" Component={Genres}/>
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
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>,
)