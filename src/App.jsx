import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import Home from './pages/Home';
import Rutas from './pages/Rutas';
import Paraderos from './pages/Paraderos';
import Horarios from './pages/Horarios';
import Mapa from './pages/Mapa';
import Notificaciones from './pages/Notificaciones';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ConductorTurnos from './pages/ConductorTurnos';
import AdminTurnos from './pages/AdminTurnos';
import AdminUsuarios from './pages/AdminUsuarios';
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
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/conductor"
            element={
              <RutaProtegida roles={['conductor']}>
                <ConductorTurnos />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/turnos"
            element={
              <RutaProtegida roles={['admin']}>
                <AdminTurnos />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RutaProtegida roles={['admin']}>
                <AdminUsuarios />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/buses"
            element={
              <RutaProtegida roles={['admin']}>
                <AdminBuses />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
