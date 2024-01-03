import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, BrowserRouter, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/navbar-component/navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Shows from './pages/Shows'
import MyLists from './pages/MyLists'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import PageNotFound from './pages/NotFound'
import Genres from './pages/Genres'
import Search from './pages/Search'
import Watchlist from './pages/Watchlist'
import History from './History'
import MyProfile from './pages/MyProfile'

function App() {
  const location = useLocation();
  const showNavIn: string[] = ["/", "/movies", "/shows", "/my-lists", "/genres", "/search", "/watchlist", "/history", "/profile"];

  return (
    <>
      {showNavIn.includes(location.pathname) && <Navbar/>}
      <Routes>
        <Route path="/" Component={Home}/>
        <Route path="/movies" Component={Movies}/>
        <Route path="/shows" Component={Shows}/>
        <Route path="/my-lists" Component={MyLists}/>
        <Route path="/genres" Component={Genres}/>
        <Route path="/search" Component={Search}/>
        <Route path="/watchlist" Component={Watchlist}/>
        <Route path="/history" Component={History}/>
        <Route path="/profile" Component={MyProfile}/>
        <Route path="/login" Component={Login}/>
        <Route path="/signup" Component={SignUp}/>
        <Route path="*" Component={PageNotFound}/>
      </Routes>
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