'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [wods, setWods] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);

  // Agregamos "gender" con valor por defecto
  const [athleteForm, setAthleteForm] = useState({ fullName: '', boxName: '', gender: 'MASCULINO', categoryId: '' });
  const [wodForm, setWodForm] = useState({ name: '', description: '', type: 'TIME', categoryId: '' });
  const [scoreForm, setScoreForm] = useState({ athleteId: '', wodId: '', minutes: '', seconds: '', result: '', observations: '' });

  const [mensaje, setMensaje] = useState('');
  const [expandedWodId, setExpandedWodId] = useState<number | null>(null);

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

  const handleCreateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('https://competencias-ironbox-api.onrender.com/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fullName: athleteForm.fullName, 
        boxName: athleteForm.boxName, 
        gender: athleteForm.gender, // Enviamos el género al backend
        categoryId: Number(athleteForm.categoryId) 
      })
    });
    if (res.ok) {
      setMensaje('¡Atleta registrado con éxito!');
      setAthleteForm({ fullName: '', boxName: '', gender: 'MASCULINO', categoryId: categories[0]?.id.toString() || '' });
      fetchData();
    } else {
      setMensaje('Error al registrar atleta');
    }
  };

  const handleCreateWod = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('https://competencias-ironbox-api.onrender.com/wods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wodForm.name, description: wodForm.description, type: wodForm.type, categoryId: Number(wodForm.categoryId) })
    });
    if (res.ok) {
      setMensaje('¡WOD creado con éxito!');
      setWodForm({ name: '', description: '', type: 'TIME', categoryId: categories[0]?.id.toString() || '' });
      fetchData();
    }
  };

  const handleCreateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWod = wods.find(w => w.id === Number(scoreForm.wodId));
    if (!selectedWod) return setMensaje('Debes seleccionar un WOD válido');

    let resultValue = 0;
    let resultString = '';

    if (selectedWod.type === 'TIME') {
      const m = Number(scoreForm.minutes) || 0;
      const s = Number(scoreForm.seconds) || 0;
      resultValue = (m * 60) + s; 
      resultString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else if (selectedWod.type === 'REPS') {
      resultValue = Number(scoreForm.result);
      resultString = `${resultValue} reps`;
    } else if (selectedWod.type === 'WEIGHT') {
      resultValue = Number(scoreForm.result);
      resultString = `${resultValue} kg`;
    }

    const bodyData = {
      athleteId: Number(scoreForm.athleteId),
      wodId: Number(scoreForm.wodId),
      resultValue,
      resultString,
      observations: scoreForm.observations || undefined,
    };

    const res = await fetch('https://competencias-ironbox-api.onrender.com/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      setMensaje('¡Puntuación cargada con éxito! (Posiciones actualizadas)');
      setScoreForm({ athleteId: '', wodId: '', minutes: '', seconds: '', result: '', observations: '' });
      fetchData();
    }
  };

  const handleDeleteAthlete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este atleta?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/athletes/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchData(); }
  };
  const handleDeleteWod = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este WOD?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/wods/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchData(); }
  };
  const handleDeleteScore = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta puntuación? Se recalculará la tabla.')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/scores/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchData(); }
  };

  const currentWod = wods.find(w => w.id.toString() === scoreForm.wodId);
  const selectedAthlete = athletes.find(a => a.id.toString() === scoreForm.athleteId);
  const filteredWods = selectedAthlete ? wods.filter(w => w.categoryId === selectedAthlete.categoryId) : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">Panel de Administración</h1>

      {mensaje && (
        <div className="bg-green-500 text-white p-4 rounded mb-8 text-center font-bold transition">
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Formulario Atleta */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">1. Registrar Atleta</h2>
            <form onSubmit={handleCreateAthlete} className="flex flex-col gap-4">
              <input className="p-2 bg-gray-700 rounded text-white" placeholder="Nombre completo" value={athleteForm.fullName} onChange={e => setAthleteForm({...athleteForm, fullName: e.target.value})} required />
              <input className="p-2 bg-gray-700 rounded text-white" placeholder="Box (Opcional)" value={athleteForm.boxName} onChange={e => setAthleteForm({...athleteForm, boxName: e.target.value})} />
              
              {/* SELECTOR DE GÉNERO NUEVO */}
              <select className="p-2 bg-gray-700 rounded text-white font-bold" value={athleteForm.gender} onChange={e => setAthleteForm({...athleteForm, gender: e.target.value})} required>
                <option value="MASCULINO">🚹 Masculino</option>
                <option value="FEMENINO">🚺 Femenino</option>
              </select>

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
              <textarea className="p-2 bg-gray-700 rounded text-white resize-y min-h-[80px]" placeholder="Descripción detallada del WOD..." value={wodForm.description} onChange={e => setWodForm({...wodForm, description: e.target.value})} />
              <select className="p-2 bg-gray-700 rounded text-white font-bold text-blue-300" value={wodForm.type} onChange={e => setWodForm({...wodForm, type: e.target.value})} required>
                <option value="TIME">⏱️ Por Tiempo (For Time)</option>
                <option value="REPS">🔄 Máximas Reps (AMRAP)</option>
                <option value="WEIGHT">🏋️ Peso Máximo (RM)</option>
              </select>
              <select className="p-2 bg-gray-700 rounded text-white" value={wodForm.categoryId} onChange={e => setWodForm({...wodForm, categoryId: e.target.value})} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700 transition">Guardar WOD</button>
            </form>
        </div>

        {/* Formulario Puntuación */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-blue-400">3. Cargar Resultado</h2>
            <form onSubmit={handleCreateScore} className="flex flex-col gap-4">
              <select className="p-2 bg-gray-700 rounded text-white" value={scoreForm.athleteId} onChange={e => {
                setScoreForm({ ...scoreForm, athleteId: e.target.value, wodId: '', minutes: '', seconds: '', result: '' });
              }} required>
                <option value="">Seleccionar Atleta...</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.fullName} ({a.category?.name}) - {a.gender === 'MASCULINO' ? '🚹' : '🚺'}</option>)}
              </select>
              
              <select className={`p-2 rounded text-white transition ${scoreForm.athleteId ? 'bg-gray-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-red-900/50'}`} value={scoreForm.wodId} onChange={e => setScoreForm({...scoreForm, wodId: e.target.value, minutes: '', seconds: '', result: ''})} required disabled={!scoreForm.athleteId}>
                <option value="">{scoreForm.athleteId ? 'Seleccionar WOD...' : '👈 Primero selecciona un atleta'}</option>
                {filteredWods.map(w => <option key={w.id} value={w.id}>{w.name} - {w.category?.name}</option>)}
              </select>

              {currentWod?.type === 'TIME' && (
                <div className="flex gap-2 bg-gray-900 p-2 rounded border border-gray-600">
                  <div className="w-1/2 flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">Minutos</label>
                    <input type="number" className="p-2 bg-gray-700 rounded text-white" placeholder="00" value={scoreForm.minutes} onChange={e => setScoreForm({...scoreForm, minutes: e.target.value})} required />
                  </div>
                  <div className="w-1/2 flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">Segundos</label>
                    <input type="number" className="p-2 bg-gray-700 rounded text-white" placeholder="00" value={scoreForm.seconds} onChange={e => setScoreForm({...scoreForm, seconds: e.target.value})} required max="59" />
                  </div>
                </div>
              )}
              {(currentWod?.type === 'REPS' || currentWod?.type === 'WEIGHT') && (
                <div className="flex flex-col bg-gray-900 p-2 rounded border border-gray-600">
                  <label className="text-xs text-gray-400 mb-1">Resultado (Reps o Kilos)</label>
                  <input type="number" className="p-2 bg-gray-700 rounded text-white" placeholder="Ej: 120" value={scoreForm.result} onChange={e => setScoreForm({...scoreForm, result: e.target.value})} required />
                </div>
              )}
              <button type="submit" disabled={!currentWod} className={`p-2 rounded font-bold transition ${currentWod ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                {currentWod ? 'Guardar y Calcular Posición' : 'Selecciona un WOD'}
              </button>
            </form>
        </div>
      </div>

      <hr className="border-gray-700 mb-12" />

      {/* RECUADROS */}
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-300">Resumen de Datos Cargados</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Atletas (AQUÍ SE MUESTRA EL ICONO DEL GÉNERO) */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-96 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-600 pb-2 text-blue-300">🏃 Atletas ({athletes.length})</h3>
          <ul className="flex flex-col gap-2">
            {athletes.map(a => (
              <li key={a.id} className="bg-gray-700 p-3 rounded text-sm flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{a.fullName}</span>
                    {/* ICONO DEL GÉNERO */}
                    <span className="text-xl" title={a.gender}>{a.gender === 'MASCULINO' ? '🚹' : '🚺'}</span>
                    <span className="text-blue-300 text-xs bg-gray-900 px-2 py-1 rounded">{a.category?.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs mt-1">🏢 Box: {a.boxName ? a.boxName : 'Independiente'}</span>
                </div>
                <button onClick={() => handleDeleteAthlete(a.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition">🗑️</button>
              </li>
            ))}
          </ul>
        </div>

        {/* WODs */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-96 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-600 pb-2 text-blue-300">🏋️ WODs ({wods.length})</h3>
          <ul className="flex flex-col gap-2">
            {wods.map(w => (
              <li key={w.id} className="bg-gray-700 p-3 rounded text-sm flex flex-col transition-all">
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{w.name}</strong>
                      <span className="text-blue-300 text-xs bg-gray-900 px-2 py-1 rounded">{w.category?.name}</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-xs mt-1">{w.type === 'TIME' ? '⏱️ Por Tiempo' : w.type === 'REPS' ? '🔄 AMRAP' : '🏋️ Peso (RM)'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExpandedWodId(expandedWodId === w.id ? null : w.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold transition">
                      {expandedWodId === w.id ? '🔼' : 'ℹ️'}
                    </button>
                    <button onClick={() => handleDeleteWod(w.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition">🗑️</button>
                  </div>
                </div>
                {expandedWodId === w.id && (
                  <div className="mt-3 p-3 bg-gray-800 rounded border-l-2 border-blue-500 text-gray-300 text-xs whitespace-pre-wrap shadow-inner">{w.description}</div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Puntuaciones */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto max-h-96 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-600 pb-2 text-blue-300">📝 Puntuaciones ({scores.length})</h3>
          <ul className="flex flex-col gap-2">
            {scores.map(s => (
              <li key={s.id} className="bg-gray-700 p-3 rounded text-sm flex justify-between items-center">
                <div className="flex flex-col w-full mr-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-400">{s.athlete?.fullName}</span>
                    <span className="text-yellow-400 font-bold bg-gray-800 px-2 rounded text-xs">{s.resultString}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
                    <span className="bg-gray-800 px-2 py-1 rounded">{s.wod?.name}</span>
                    <span className="font-bold text-blue-300">Pos: {s.position}º | {s.points} pts</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteScore(s.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition">🗑️</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}