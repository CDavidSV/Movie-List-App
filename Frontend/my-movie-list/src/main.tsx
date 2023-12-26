import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Shows from './pages/Shows'
import MyLists from './pages/MyLists'
import Login from './pages/Login'
import PageNotFound from './pages/NotFound'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" Component={Home}/>
        <Route path="/movies" Component={Movies}/>
        <Route path="/shows" Component={Shows}/>
        <Route path="/my-lists" Component={MyLists}/>
        <Route path="/login" Component={Login}/>
        <Route path="*" Component={PageNotFound}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)