'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [wods, setWods] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);

  // Estados para los formularios
  const [athleteForm, setAthleteForm] = useState({ fullName: '', boxName: '', categoryId: '' });
  const [wodForm, setWodForm] = useState({ name: '', description: '', categoryId: '' });
  const [scoreForm, setScoreForm] = useState({ athleteId: '', wodId: '', position: '', points: '', observations: '' });

  const [mensaje, setMensaje] = useState('');

  // Función para descargar la info fresca de la base de datos
  const fetchData = () => {
    fetch('https://competencias-ironbox-api.onrender.com/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setAthleteForm(prev => prev.categoryId ? prev : { ...prev, categoryId: data[0].id.toString() });
          setWodForm(prev => prev.categoryId ? prev : { ...prev, categoryId: data[0].id.toString() });
        }
      })
      .catch(() => {});

    fetch('https://competencias-ironbox-api.onrender.com/athletes').then(res => res.json()).then(data => setAthletes(data)).catch(() => {});
    fetch('https://competencias-ironbox-api.onrender.com/wods').then(res => res.json()).then(data => setWods(data)).catch(() => {});
    fetch('https://competencias-ironbox-api.onrender.com/scores').then(res => res.json()).then(data => setScores(data)).catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Registrar Atleta
  const handleCreateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('https://competencias-ironbox-api.onrender.com/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: athleteForm.fullName, boxName: athleteForm.boxName, categoryId: Number(athleteForm.categoryId) })
    });
    if (res.ok) {
      setMensaje('¡Atleta registrado con éxito!');
      setAthleteForm({ fullName: '', boxName: '', categoryId: categories[0]?.id.toString() || '' });
      fetchData();
    } else {
      setMensaje('Error al registrar atleta');
    }
  };

  // 2. Crear WOD
  const handleCreateWod = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('https://competencias-ironbox-api.onrender.com/wods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wodForm.name, description: wodForm.description, categoryId: Number(wodForm.categoryId) })
    });
    if (res.ok) {
      setMensaje('¡WOD creado con éxito!');
      setWodForm({ name: '', description: '', categoryId: categories[0]?.id.toString() || '' });
      fetchData();
    } else {
      setMensaje('Error al crear WOD');
    }
  };

  // 3. Cargar Puntuación
  const handleCreateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const bodyData = {
      athleteId: Number(scoreForm.athleteId),
      wodId: Number(scoreForm.wodId),
      position: Number(scoreForm.position),
      points: Number(scoreForm.points),
      observations: scoreForm.observations || undefined,
    };

    const res = await fetch('https://competencias-ironbox-api.onrender.com/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      setMensaje('¡Puntuación cargada con éxito!');
      setScoreForm({ athleteId: '', wodId: '', position: '', points: '', observations: '' });
      fetchData();
    } else {
      setMensaje('Error al cargar puntuación');
    }
  };

  // Funciones para Borrar
  const handleDeleteAthlete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este atleta?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/athletes/${id}`, { method: 'DELETE' });
    if (res.ok) { setMensaje('Atleta eliminado con éxito'); fetchData(); }
    else { setMensaje('Error al eliminar el atleta'); }
  };

  const handleDeleteWod = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este WOD?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/wods/${id}`, { method: 'DELETE' });
    if (res.ok) { setMensaje('WOD eliminado con éxito'); fetchData(); }
    else { setMensaje('Error al eliminar el WOD'); }
  };

  const handleDeleteScore = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta puntuación?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/scores/${id}`, { method: 'DELETE' });
    if (res.ok) { setMensaje('Puntuación eliminada con éxito'); fetchData(); }
    else { setMensaje('Error al eliminar la puntuación'); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">Panel de Administración</h1>

      {mensaje && (
        <div className="bg-green-500 text-white p-4 rounded mb-8 text-center font-bold">
          {mensaje}
        </div>
      )}

      {/* FORMULARIOS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Formulario Atleta */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">1. Registrar Atleta</h2>
            <form onSubmit={handleCreateAthlete} className="flex flex-col gap-4">
              <input className="p-2 bg-gray-700 rounded text-white" placeholder="Nombre completo" value={athleteForm.fullName} onChange={e => setAthleteForm({...athleteForm, fullName: e.target.value})} required />
              <input className="p-2 bg-gray-700 rounded text-white" placeholder="Box (Opcional)" value={athleteForm.boxName} onChange={e => setAthleteForm({...athleteForm, boxName: e.target.value})} />
              <select className="p-2 bg-gray-700 rounded text-white" value={athleteForm.categoryId} onChange={e => setAthleteForm({...athleteForm, categoryId: e.target.value})} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700 transition">Guardar Atleta</button>
            </form>
        </div>

        {/* Formulario WOD */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">2. Crear WOD</h2>
            <form onSubmit={handleCreateWod} className="flex flex-col gap-4">
              <input className="p-2 bg-gray-700 rounded text-white" placeholder="Nombre (Ej: WOD 1)" value={wodForm.name} onChange={e => setWodForm({...wodForm, name: e.target.value})} required />
              <input className="p-2 bg-gray-700 rounded text-white" placeholder="Descripción" value={wodForm.description} onChange={e => setWodForm({...wodForm, description: e.target.value})} />
              <select className="p-2 bg-gray-700 rounded text-white" value={wodForm.categoryId} onChange={e => setWodForm({...wodForm, categoryId: e.target.value})} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700 transition">Guardar WOD</button>
            </form>
        </div>

        {/* Formulario Puntuación */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">3. Cargar Puntuación</h2>
            <form onSubmit={handleCreateScore} className="flex flex-col gap-4">
              <select className="p-2 bg-gray-700 rounded text-white" value={scoreForm.athleteId} onChange={e => setScoreForm({...scoreForm, athleteId: e.target.value})} required>
                <option value="">Seleccionar Atleta...</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.fullName} ({a.category?.name || 'Sin Categoría'})</option>)}
              </select>
              <select className="p-2 bg-gray-700 rounded text-white" value={scoreForm.wodId} onChange={e => setScoreForm({...scoreForm, wodId: e.target.value})} required>
                <option value="">Seleccionar WOD...</option>
                {wods.map(w => <option key={w.id} value={w.id}>{w.name} - {w.category?.name || 'Sin Categoría'}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="number" className="p-2 bg-gray-700 rounded w-1/2 text-white" placeholder="Posición" value={scoreForm.position} onChange={e => setScoreForm({...scoreForm, position: e.target.value})} required />
                <input type="number" className="p-2 bg-gray-700 rounded w-1/2 text-white" placeholder="Puntos" value={scoreForm.points} onChange={e => setScoreForm({...scoreForm, points: e.target.value})} required />
              </div>
              <button type="submit" className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700 transition">Guardar Puntuación</button>
            </form>
        </div>
      </div>

      <hr className="border-gray-700 mb-12" />

      {/* RECUADROS CON BOTONES DE BORRAR Y GIMNASIOS VISIBLES */}
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-300">Resumen de Datos Cargados</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recuadro de Atletas (AHORA MUESTRA EL GIMNASIO) */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-96 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-600 pb-2 text-blue-300">🏃 Atletas ({athletes.length})</h3>
          <ul className="flex flex-col gap-2">
            {athletes.map(a => (
              <li key={a.id} className="bg-gray-700 p-3 rounded text-sm flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{a.fullName}</span>
                    <span className="text-blue-300 text-xs bg-gray-900 px-2 py-1 rounded">{a.category?.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs mt-1">
                     Box: {a.boxName ? a.boxName : 'Independiente'}
                  </span>
                </div>
                <button onClick={() => handleDeleteAthlete(a.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition">🗑️ Borrar</button>
              </li>
            ))}
            {athletes.length === 0 && <p className="text-gray-500 text-sm text-center">No hay atletas cargados</p>}
          </ul>
        </div>

        {/* Recuadro de WODs */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-96 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-600 pb-2 text-blue-300">🏋️ WODs ({wods.length})</h3>
          <ul className="flex flex-col gap-2">
            {wods.map(w => (
              <li key={w.id} className="bg-gray-700 p-3 rounded text-sm flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{w.name}</strong>
                    <span className="text-blue-300 text-xs bg-gray-900 px-2 py-1 rounded">{w.category?.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs mt-1">{w.description || 'Sin descripción'}</span>
                </div>
                <button onClick={() => handleDeleteWod(w.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition">🗑️ Borrar</button>
              </li>
            ))}
            {wods.length === 0 && <p className="text-gray-500 text-sm text-center">No hay WODs cargados</p>}
          </ul>
        </div>

        {/* Recuadro de Puntuaciones */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-96 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-600 pb-2 text-blue-300">📝 Puntuaciones ({scores.length})</h3>
          <ul className="flex flex-col gap-2">
            {scores.map(s => (
              <li key={s.id} className="bg-gray-700 p-3 rounded text-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-green-400 mb-1">{s.athlete?.fullName || `Atleta Desconocido`}</div>
                  <div className="flex gap-2 items-center text-xs text-gray-300">
                    <span className="bg-gray-800 px-2 py-1 rounded">{s.wod?.name || `WOD Desconocido`} - {s.wod?.category?.name || ''}</span>
                    <span className="font-bold">Pos: {s.position} | Pts: {s.points}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteScore(s.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition">🗑️ Borrar</button>
              </li>
            ))}
            {scores.length === 0 && <p className="text-gray-500 text-sm text-center">No hay puntuaciones cargadas</p>}
          </ul>
        </div>

      </div>
    </div>
  );
}