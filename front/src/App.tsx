import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DashboardLayout from "./layout/DashboardLayout";
import PantallaPrincipal from "./pages/PantallaPrincipal";
import PantallaClientes from "./pages/PantallaClientes";
import PantallaOrdenes from "./pages/PantallaOrdenes";
import PantallaServicios from "./pages/PantallaServicios";
import PantallaConfiguracion from "./pages/PantallaConfiguracion";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<PantallaPrincipal />} />
          <Route path="/clientes" element={<PantallaClientes />} />
          <Route path="/ordenes" element={<PantallaOrdenes />} />
          <Route path="/servicios" element={<PantallaServicios />} />
          <Route path="/configuracion" element={<PantallaConfiguracion />} />
        </Route>
      </Routes>
      {/* Toast container global para mostrar notificaciones */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
