import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Ayuda } from "./pages/Ayuda";
import { BaseTecnica } from "./pages/BaseTecnica";
import { Ingreso } from "./pages/Ingreso";
import { Inicio } from "./pages/Inicio";
import { MisSalas } from "./pages/MisSalas";
import { NoEncontrada } from "./pages/NoEncontrada";
import { Perfil } from "./pages/Perfil";
import { Registro } from "./pages/Registro";
import { Sala } from "./pages/Sala";

// Una ruta por cada pantalla del mapa del sitio.
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="ingreso" element={<Ingreso />} />
        <Route path="registro" element={<Registro />} />
        <Route path="salas" element={<MisSalas />} />
        <Route path="salas/:id" element={<Sala />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="ayuda" element={<Ayuda />} />
        <Route path="base-tecnica" element={<BaseTecnica />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
