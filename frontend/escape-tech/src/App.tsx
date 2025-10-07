import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import RoomTest from './components/RoomTest'
import Lobby from './components/Lobby'
import Home from './components/Home'
import MedecinPage from './components/Medecin'
import PharmacienPage from './components/Pharmacien'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/room" element={<RoomTest />} />
        <Route path="/medecin" element={<PharmacienPage />} />
        <Route path="/pharmacien" element={<MedecinPage />} />
      </Routes>
    </Router>
  )
}

export default App