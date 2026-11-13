import { Route, Routes } from "react-router-dom";
import { LayoutApp } from "./components/LayoutApp";
import { LayoutPublico } from "./components/LayoutPublico";
import { Ayuda } from "./pages/Ayuda";
import { BaseTecnica } from "./pages/BaseTecnica";
import { Ingreso } from "./pages/Ingreso";
import { Inicio } from "./pages/Inicio";
import { MisSalas } from "./pages/MisSalas";
import { NoEncontrada } from "./pages/NoEncontrada";
import { Perfil } from "./pages/Perfil";
import { Registro } from "./pages/Registro";
import { Sala } from "./pages/Sala";
import { RutaPrivada } from "./sesion/Rutas";

// Una ruta por cada pantalla del mapa del sitio, en dos grupos:
// públicas (antes de ingresar) y privadas (con sesión iniciada).
export function App() {
  return (
    <Routes>
      <Route element={<LayoutPublico />}>
        <Route index element={<Inicio />} />
        <Route path="ingreso" element={<Ingreso />} />
        <Route path="registro" element={<Registro />} />
        <Route path="ayuda" element={<Ayuda />} />
        <Route path="base-tecnica" element={<BaseTecnica />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
      <Route
        element={
          <RutaPrivada>
            <LayoutApp />
          </RutaPrivada>
        }
      >
        <Route path="salas" element={<MisSalas />} />
        <Route path="salas/:id" element={<Sala />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
}
