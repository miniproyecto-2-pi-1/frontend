import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Campo } from "../components/Campo";
import { Dialogo } from "../components/Dialogo";
import { COLORES_SALA, generarId, guardarSalas, leerSalas, type Sala } from "../data/salas";
import { useTitulo } from "../hooks/useTitulo";

function textoConectadas(n: number): string {
  if (n === 0) return "Nadie conectado";
  return n === 1 ? "1 conectada" : `${n} conectadas`;
}

// Mis salas (demostración del Sprint 0): las salas son de ejemplo y se guardan en el navegador.
// Las salas reales (Firestore, a través de la API) llegan en el Sprint 2 (US-06) y el Sprint 3 (US-08).
export function MisSalas() {
  useTitulo("Mis salas");
  const navegar = useNavigate();
  const [salas, setSalas] = useState<Sala[]>(leerSalas);
  const [codigo, setCodigo] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [crear, setCrear] = useState(false);
  const [nombre, setNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [aviso, setAviso] = useState("");

  function unirse(e: FormEvent) {
    e.preventDefault();
    const id = codigo.trim().toUpperCase();
    if (!id) return setErrorCodigo("Escribe el ID de la sala.");
    if (!salas.some((s) => s.id === id)) return setErrorCodigo("Sala no encontrada. Revisa el ID e inténtalo de nuevo.");
    setErrorCodigo("");
    navegar(`/salas/${id}`);
  }

  function crearSala(e: FormEvent) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return setErrorNombre("Escribe un nombre para la sala.");
    if (limpio.length > 40) return setErrorNombre("El nombre no puede pasar de 40 caracteres.");
    const nueva: Sala = { id: generarId(), nombre: limpio, rol: "Anfitrión", conectadas: 0, color: salas.length % COLORES_SALA.length };
    const todas = [...salas, nueva];
    setSalas(todas);
    guardarSalas(todas);
    cerrarCrear();
    navegar(`/salas/${nueva.id}`); // el anfitrión entra a su sala recién creada (US-06)
  }

  function cerrarCrear() {
    setCrear(false);
    setNombre("");
    setErrorNombre("");
  }

  async function copiarId(sala: Sala) {
    try {
      await navigator.clipboard.writeText(sala.id);
      setAviso(`ID copiado: ${sala.id}`);
    } catch {
      setAviso(`No se pudo copiar. El ID es ${sala.id}`);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Mis salas</h1>
        <button type="button" className="btn-principal" onClick={() => setCrear(true)}>
          <span aria-hidden="true">＋</span> Nueva sala
        </button>
      </div>

      <form onSubmit={unirse} className="tarjeta mb-8 max-w-xl" noValidate>
        <Campo
          id="id-sala"
          etiqueta="Unirme a una sala"
          placeholder="Introduce el ID de la sala"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          error={errorCodigo}
          ayuda="Es el código que te compartió quien creó la sala, por ejemplo K7P2-91XQ."
          autoComplete="off"
        />
        <button type="submit" className="btn-principal mt-3">
          Unirme
        </button>
      </form>

      <div role="status" className="mb-4 min-h-6 font-bold text-exito">
        {aviso}
      </div>

      <h2 className="mb-3 text-xl font-bold">Tus salas</h2>
      {salas.length === 0 ? (
        <section className="tarjeta max-w-xl text-center">
          <h3 className="mb-1 text-lg font-bold">Aún no tienes salas</h3>
          <p className="text-suave">Crea una sala o únete con el ID que te compartieron.</p>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salas.map((s) => (
            <li key={s.id} className="overflow-hidden rounded-[10px] border border-borde bg-superficie">
              <div className="p-4 text-white" style={{ background: COLORES_SALA[s.color % COLORES_SALA.length] }}>
                <h3 className="text-lg font-bold">{s.nombre}</h3>
                <p className="text-sm">{s.id}</p>
              </div>
              <div className="p-4">
                <p>{s.rol}</p>
                <p className="text-suave">{textoConectadas(s.conectadas)}</p>
              </div>
              <div className="flex items-center justify-between border-t border-borde px-4 py-3">
                <Link to={`/salas/${s.id}`} className="font-bold text-enlace underline" aria-label={`Entrar a ${s.nombre}`}>
                  Entrar
                </Link>
                <button type="button" onClick={() => copiarId(s)} className="text-suave underline" aria-label={`Copiar ID de ${s.nombre}`}>
                  Copiar ID
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialogo abierto={crear} onCerrar={cerrarCrear} titulo="Nueva sala">
        <form onSubmit={crearSala} className="flex flex-col gap-3" noValidate>
          <Campo
            id="nombre-sala"
            etiqueta="Nombre de la sala"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errorNombre}
            ayuda="Al crearla recibirás un ID para compartir con tu grupo."
            autoComplete="off"
          />
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" className="btn-secundario" onClick={cerrarCrear}>
              Cancelar
            </button>
            <button type="submit" className="btn-principal">
              Crear sala
            </button>
          </div>
        </form>
      </Dialogo>
    </div>
  );
}
