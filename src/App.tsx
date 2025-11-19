import {BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./component/header.tsx";
import Home from "./component/Home";
import UserInfo from "./component/UserInfo";
import UserInfo2 from "./component/UserInfo2";
import UserInfo3 from "./component/UserInfo3";
import './App.css'

function App() {
 
  return (
    <BrowserRouter>
    <div className="App !bg-white">
      <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/user-info2" element={<UserInfo2 />} />
          <Route path="/user-info3" element={<UserInfo3 />} />
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
