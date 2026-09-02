import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rutas from './pages/Rutas';
import Paraderos from './pages/Paraderos';
import Horarios from './pages/Horarios';
import Mapa from './pages/Mapa';
import Notificaciones from './pages/Notificaciones';
import AdminBuses from './pages/AdminBuses';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/paraderos" element={<Paraderos />} />
          <Route path="/horarios" element={<Horarios />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/admin/buses" element={<AdminBuses />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
