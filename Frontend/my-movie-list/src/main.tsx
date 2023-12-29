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

function App() {
  const location = useLocation();
  const showNavIn: string[] = ["/", "/movies", "/shows", "/my-lists", "/genres", "/search"];

  return (
    <div>
      {showNavIn.includes(location.pathname) && <Navbar/>}
      <Routes>
        <Route path="/" Component={Home}/>
        <Route path="/movies" Component={Movies}/>
        <Route path="/shows" Component={Shows}/>
        <Route path="/my-lists" Component={MyLists}/>
        <Route path="/genres" Component={Genres}/>
        <Route path="/search" Component={Search}/>
        <Route path="/login" Component={Login}/>
        <Route path="/signup" Component={SignUp}/>
        <Route path="*" Component={PageNotFound}/>
      </Routes>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>,
)