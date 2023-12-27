import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Movies from './pages/Movies/Movies'
import Shows from './pages/Shows/Shows'
import MyLists from './pages/MyLists/MyLists'
import Login from './pages/Login/Login'
import PageNotFound from './pages/NotFound'
import Browse from './pages/Browse/Browse'
import Search from './pages/Search/Search'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Home}/>
        <Route path="/movies" Component={Movies}/>
        <Route path="/shows" Component={Shows}/>
        <Route path="/my-lists" Component={MyLists}/>
        <Route path="/browse" Component={Browse}/>
        <Route path="/search" Component={Search}/>
        <Route path="/login" Component={Login}/>
        <Route path="*" Component={PageNotFound}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)