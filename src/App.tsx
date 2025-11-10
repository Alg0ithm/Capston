import {BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./component/Home";
import UserInfo from "./component/UserInfo";
import './App.css'

function App() {
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-info" element={<UserInfo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
