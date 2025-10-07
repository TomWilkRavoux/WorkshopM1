// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import RoomTest from './components/RoomTest'
import Lobby from './components/Lobby'
import Home from './components/Home'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/room" element={<RoomTest />} />
      </Routes>
    </Router>
  )
}

export default App
