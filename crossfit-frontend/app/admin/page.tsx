'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [wods, setWods] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);

  const [athleteForm, setAthleteForm] = useState({ fullName: '', boxName: '', gender: 'MASCULINO', categoryId: '' });
  const [wodForm, setWodForm] = useState({ name: '', description: '', type: 'TIME', categoryId: '' });
  const [scoreForm, setScoreForm] = useState({ athleteId: '', wodId: '', minutes: '', seconds: '', result: '', observations: '' });

  const [scoreFilter, setScoreFilter] = useState({ gender: '', categoryId: '' });
  const [mensaje, setMensaje] = useState('');
  const [expandedWodId, setExpandedWodId] = useState<number | null>(null);

  // Control de los formularios superiores
  const [showAthleteForm, setShowAthleteForm] = useState(false); 
  const [showWodForm, setShowWodForm] = useState(false);       
  const [showScoreForm, setShowScoreForm] = useState(true);    

  // NUEVO: Control de las listas de resumen
  const [showAthletesList, setShowAthletesList] = useState(true);
  const [showWodsList, setShowWodsList] = useState(true);
  const [showScoresList, setShowScoresList] = useState(true);

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
        gender: athleteForm.gender,
        categoryId: Number(athleteForm.categoryId) 
      })
    });
    if (res.ok) {
      setMensaje('¡Atleta registrado con éxito!');
      setAthleteForm({ fullName: '', boxName: '', gender: 'MASCULINO', categoryId: categories[0]?.id.toString() || '' });
      fetchData();
      setTimeout(() => setMensaje(''), 3000);
    } else {
      setMensaje('Error al registrar atleta');
      setTimeout(() => setMensaje(''), 3000);
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
      setTimeout(() => setMensaje(''), 3000);
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
      setMensaje('¡Puntuación cargada con éxito!');
      setScoreForm({ ...scoreForm, athleteId: '', wodId: '', minutes: '', seconds: '', result: '', observations: '' });
      fetchData();
      setTimeout(() => setMensaje(''), 3000);
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

  // Filtrado en cascada
  const currentWod = wods.find(w => w.id.toString() === scoreForm.wodId);
  
  // NUEVO: Atletas ordenados alfabéticamente ANTES de filtrar
  const sortedAthletes = [...athletes].sort((a, b) => a.fullName.localeCompare(b.fullName));
  
  const filteredAthletes = sortedAthletes.filter(a => {
    const matchGender = scoreFilter.gender ? a.gender === scoreFilter.gender : false;
    const matchCategory = scoreFilter.categoryId ? a.categoryId.toString() === scoreFilter.categoryId : false;
    return matchGender && matchCategory;
  });
  
  const filteredWods = wods.filter(w => w.categoryId.toString() === scoreFilter.categoryId);

  // CLASES REUTILIZABLES
  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#1a2b4c] focus:border-[#27aae1] focus:ring-1 focus:ring-[#27aae1] outline-none transition-all";
  const selectClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#1a2b4c] focus:border-[#27aae1] outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-100 font-medium";
  const labelClass = "text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#eaf5fa] text-[#1a2b4c] p-4 md:p-8 font-sans">
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a2b4c] mb-8 text-center uppercase tracking-tight">
        Panel de <span className="text-[#d91470]">Administración</span>
      </h1>

      {mensaje && (
        <div className="max-w-4xl mx-auto bg-[#27aae1] text-white p-4 rounded-xl mb-8 text-center font-bold shadow-lg animate-pulse">
          {mensaje}
        </div>
      )}

      {/* FORMULARIOS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start max-w-7xl mx-auto">
        
        {/* Formulario 1: Atleta */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <button type="button" onClick={() => setShowAthleteForm(!showAthleteForm)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-extrabold text-[#1a2b4c]">1. Registrar Atleta</h2>
              <span className="text-[#27aae1] text-xl">{showAthleteForm ? '🔼' : '🔽'}</span>
            </button>
            {showAthleteForm && (
              <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                <form onSubmit={handleCreateAthlete} className="flex flex-col gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Nombre Completo</label>
                    <input className={inputClass} placeholder="Ej: Juan Pérez" value={athleteForm.fullName} onChange={e => setAthleteForm({...athleteForm, fullName: e.target.value})} required />
                  </div>
                  <div>
                    <label className={labelClass}>Box (Opcional)</label>
                    <input className={inputClass} placeholder="Ej: Iron Box" value={athleteForm.boxName} onChange={e => setAthleteForm({...athleteForm, boxName: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Género</label>
                    <select className={selectClass} value={athleteForm.gender} onChange={e => setAthleteForm({...athleteForm, gender: e.target.value})} required>
                      <option value="MASCULINO">🚹 Masculino</option>
                      <option value="FEMENINO">🚺 Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Categoría</label>
                    <select className={selectClass} value={athleteForm.categoryId} onChange={e => setAthleteForm({...athleteForm, categoryId: e.target.value})} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="mt-2 bg-[#1a2b4c] text-white p-3 rounded-xl font-bold hover:bg-[#1a2b4c]/90 transition shadow-md">Guardar Atleta</button>
                </form>
              </div>
            )}
        </div>

        {/* Formulario 2: WOD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <button type="button" onClick={() => setShowWodForm(!showWodForm)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-extrabold text-[#1a2b4c]">2. Crear WOD</h2>
              <span className="text-[#27aae1] text-xl">{showWodForm ? '🔼' : '🔽'}</span>
            </button>
            {showWodForm && (
              <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                <form onSubmit={handleCreateWod} className="flex flex-col gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Nombre del WOD</label>
                    <input className={inputClass} placeholder="Ej: WOD 1 - Final" value={wodForm.name} onChange={e => setWodForm({...wodForm, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className={labelClass}>Descripción</label>
                    <textarea className={`${inputClass} resize-y min-h-[80px]`} placeholder="Detalles del WOD..." value={wodForm.description} onChange={e => setWodForm({...wodForm, description: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Tipo de Medición</label>
                    <select className={`${selectClass} text-[#d91470] font-bold`} value={wodForm.type} onChange={e => setWodForm({...wodForm, type: e.target.value})} required>
                      <option value="TIME">⏱️ Por Tiempo (For Time)</option>
                      <option value="REPS">🔄 Máximas Reps (AMRAP)</option>
                      <option value="WEIGHT">🏋️ Peso Máximo (RM)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Categoría</label>
                    <select className={selectClass} value={wodForm.categoryId} onChange={e => setWodForm({...wodForm, categoryId: e.target.value})} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="mt-2 bg-[#1a2b4c] text-white p-3 rounded-xl font-bold hover:bg-[#1a2b4c]/90 transition shadow-md">Guardar WOD</button>
                </form>
              </div>
            )}
        </div>

        {/* Formulario 3: Puntuación */}
        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-t-[#d91470] overflow-hidden">
            <button type="button" onClick={() => setShowScoreForm(!showScoreForm)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-extrabold text-[#1a2b4c]">3. Carga Ágil</h2>
              <span className="text-[#d91470] text-xl">{showScoreForm ? '🔼' : '🔽'}</span>
            </button>
            {showScoreForm && (
              <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                <form onSubmit={handleCreateScore} className="flex flex-col gap-4 mt-4">
                  <div className="flex gap-3">
                    <div className="w-1/2">
                      <label className={labelClass}>1. Género</label>
                      <select className={selectClass} value={scoreFilter.gender} onChange={e => { setScoreFilter({ ...scoreFilter, gender: e.target.value }); setScoreForm({ ...scoreForm, athleteId: '', wodId: '' }); }} required>
                        <option value="">Seleccionar...</option>
                        <option value="MASCULINO">🚹 Masculino</option>
                        <option value="FEMENINO">🚺 Femenino</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>2. Categoría</label>
                      <select className={selectClass} value={scoreFilter.categoryId} onChange={e => { setScoreFilter({ ...scoreFilter, categoryId: e.target.value }); setScoreForm({ ...scoreForm, athleteId: '', wodId: '' }); }} required disabled={!scoreFilter.gender}>
                        <option value="">Seleccionar...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>3. Atleta</label>
                    <select className={selectClass} value={scoreForm.athleteId} onChange={e => { setScoreForm({ ...scoreForm, athleteId: e.target.value, wodId: '', minutes: '', seconds: '', result: '' }); }} required disabled={!scoreFilter.categoryId}>
                      <option value="">{scoreFilter.categoryId ? 'Seleccionar Atleta...' : 'Filtra arriba primero'}</option>
                      {filteredAthletes.map(a => <option key={a.id} value={a.id}>{a.fullName} {a.boxName ? `(${a.boxName})` : ''}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className={labelClass}>4. Seleccionar WOD</label>
                    <select className={selectClass} value={scoreForm.wodId} onChange={e => setScoreForm({...scoreForm, wodId: e.target.value, minutes: '', seconds: '', result: ''})} required disabled={!scoreForm.athleteId}>
                      <option value="">{scoreForm.athleteId ? 'Seleccionar WOD...' : 'Selecciona un atleta'}</option>
                      {filteredWods.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>

                  {currentWod?.type === 'TIME' && (
                    <div className="flex gap-3 bg-[#eaf5fa] p-3 rounded-xl border border-[#27aae1]/30">
                      <div className="w-1/2 flex flex-col">
                        <label className="text-xs font-bold text-[#1a2b4c] mb-1 uppercase">Minutos</label>
                        <input type="number" className="p-2.5 bg-white border border-[#27aae1]/50 rounded-lg text-[#1a2b4c] font-bold text-center outline-none focus:ring-2 focus:ring-[#27aae1]" placeholder="00" value={scoreForm.minutes} onChange={e => setScoreForm({...scoreForm, minutes: e.target.value})} required />
                      </div>
                      <div className="w-1/2 flex flex-col">
                        <label className="text-xs font-bold text-[#1a2b4c] mb-1 uppercase">Segundos</label>
                        <input type="number" className="p-2.5 bg-white border border-[#27aae1]/50 rounded-lg text-[#1a2b4c] font-bold text-center outline-none focus:ring-2 focus:ring-[#27aae1]" placeholder="00" value={scoreForm.seconds} onChange={e => setScoreForm({...scoreForm, seconds: e.target.value})} required max="59" />
                      </div>
                    </div>
                  )}
                  {(currentWod?.type === 'REPS' || currentWod?.type === 'WEIGHT') && (
                    <div className="flex flex-col bg-[#eaf5fa] p-3 rounded-xl border border-[#27aae1]/30">
                      <label className="text-xs font-bold text-[#1a2b4c] mb-1 uppercase text-center">
                        {currentWod.type === 'REPS' ? 'Total de Repeticiones' : 'Kilos Levantados'}
                      </label>
                      <input type="number" className="p-2.5 bg-white border border-[#27aae1]/50 rounded-lg text-[#1a2b4c] font-bold text-center text-lg outline-none focus:ring-2 focus:ring-[#27aae1]" placeholder="Ej: 120" value={scoreForm.result} onChange={e => setScoreForm({...scoreForm, result: e.target.value})} required />
                    </div>
                  )}
                  
                  <button type="submit" disabled={!currentWod} className={`mt-2 p-3 rounded-xl font-extrabold transition shadow-md ${currentWod ? 'bg-[#d91470] hover:bg-[#b0105a] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    {currentWod ? 'Guardar Puntaje' : 'Esperando datos...'}
                  </button>
                </form>
              </div>
            )}
        </div>
      </div>

      <hr className="border-gray-200 mb-10 max-w-7xl mx-auto" />

      <h2 className="text-2xl font-extrabold text-center mb-8 text-[#1a2b4c] uppercase tracking-wide">
        Resumen de Datos Cargados
      </h2>
      
      {/* RECUADROS DE RESUMEN (Ahora Desplegables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        
        {/* LISTA: ATLETAS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowAthletesList(!showAthletesList)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-extrabold text-lg text-[#1a2b4c] flex items-center gap-2">
              🏃 Atletas <span className="bg-[#eaf5fa] text-[#27aae1] text-xs px-2 py-1 rounded-full">{athletes.length}</span>
            </h3>
            <span className="text-[#27aae1] text-xl">{showAthletesList ? '🔼' : '🔽'}</span>
          </button>
          
          {showAthletesList && (
            <div className="p-5 pt-0 border-t border-gray-100 mt-2 overflow-auto max-h-[600px] scrollbar-hide">
              {categories.map(category => {
                const catAthletes = sortedAthletes.filter(a => a.categoryId === category.id);
                if (catAthletes.length === 0) return null;
                return (
                  <div key={category.id} className="mb-6 last:mb-0">
                    <div className="bg-[#1a2b4c] text-white text-[10px] font-bold px-3 py-1 rounded-md mb-3 inline-block uppercase tracking-widest shadow-sm">
                      {category.name}
                    </div>
                    <ul className="flex flex-col gap-2">
                      {catAthletes.map(a => (
                        <li key={a.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-[#27aae1]/30 transition">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[#1a2b4c] text-sm">{a.fullName}</span>
                              <span className="text-xs" title={a.gender}>{a.gender === 'MASCULINO' ? '🚹' : '🚺'}</span>
                            </div>
                            <span className="text-gray-500 text-xs truncate max-w-[150px]">{a.boxName || 'Independiente'}</span>
                          </div>
                          <button onClick={() => handleDeleteAthlete(a.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors text-xs">🗑️</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {athletes.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-2">No hay atletas cargados</p>}
            </div>
          )}
        </div>

        {/* LISTA: WODS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowWodsList(!showWodsList)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-extrabold text-lg text-[#1a2b4c] flex items-center gap-2">
              🏋️ WODs <span className="bg-[#eaf5fa] text-[#27aae1] text-xs px-2 py-1 rounded-full">{wods.length}</span>
            </h3>
            <span className="text-[#27aae1] text-xl">{showWodsList ? '🔼' : '🔽'}</span>
          </button>
          
          {showWodsList && (
            <div className="p-5 pt-0 border-t border-gray-100 mt-2 overflow-auto max-h-[600px] scrollbar-hide">
              {categories.map(category => {
                const catWods = wods.filter(w => w.categoryId === category.id);
                if (catWods.length === 0) return null;
                return (
                  <div key={category.id} className="mb-6 last:mb-0">
                    <div className="bg-[#1a2b4c] text-white text-[10px] font-bold px-3 py-1 rounded-md mb-3 inline-block uppercase tracking-widest shadow-sm">
                      {category.name}
                    </div>
                    <ul className="flex flex-col gap-2">
                      {catWods.map(w => (
                        <li key={w.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col hover:border-[#27aae1]/30 transition">
                          <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col gap-1">
                              <strong className="text-[#1a2b4c] text-sm leading-tight">{w.name}</strong>
                              <span className="text-[#d91470] font-bold text-[10px] uppercase bg-pink-50 px-2 py-0.5 rounded inline-block w-max mt-1">
                                {w.type === 'TIME' ? '⏱️ Tiempo' : w.type === 'REPS' ? '🔄 AMRAP' : '🏋️ Peso'}
                              </span>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button onClick={() => setExpandedWodId(expandedWodId === w.id ? null : w.id)} className="bg-[#eaf5fa] text-[#27aae1] hover:bg-[#27aae1] hover:text-white p-1.5 rounded-lg transition-colors text-xs">
                                {expandedWodId === w.id ? '🔼' : 'ℹ️'}
                              </button>
                              <button onClick={() => handleDeleteWod(w.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-colors text-xs">🗑️</button>
                            </div>
                          </div>
                          {expandedWodId === w.id && (
                            <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-[#27aae1] text-gray-600 text-xs shadow-inner whitespace-pre-wrap font-medium">
                              {w.description || <span className="italic text-gray-400">Sin descripción</span>}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {wods.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-2">No hay WODs cargados</p>}
            </div>
          )}
        </div>

        {/* LISTA: PUNTUACIONES */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowScoresList(!showScoresList)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-extrabold text-lg text-[#1a2b4c] flex items-center gap-2">
              📝 Puntuaciones <span className="bg-[#eaf5fa] text-[#27aae1] text-xs px-2 py-1 rounded-full">{scores.length}</span>
            </h3>
            <span className="text-[#27aae1] text-xl">{showScoresList ? '🔼' : '🔽'}</span>
          </button>
          
          {showScoresList && (
            <div className="p-5 pt-0 border-t border-gray-100 mt-2 overflow-auto max-h-[600px] scrollbar-hide">
              {categories.map(category => {
                const catScores = scores.filter(s => s.wod?.categoryId === category.id);
                if (catScores.length === 0) return null;
                return (
                  <div key={category.id} className="mb-6 last:mb-0">
                    <div className="bg-[#1a2b4c] text-white text-[10px] font-bold px-3 py-1 rounded-md mb-3 inline-block uppercase tracking-widest shadow-sm">
                      {category.name}
                    </div>
                    <ul className="flex flex-col gap-2">
                      {catScores.map(s => (
                        <li key={s.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-[#27aae1]/30 transition">
                          <div className="flex flex-col w-full mr-3 gap-1">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-[#1a2b4c] text-sm truncate max-w-[120px]">{s.athlete?.fullName}</span>
                                <span className="text-[10px]">{s.athlete?.gender === 'MASCULINO' ? '🚹' : '🚺'}</span>
                              </div>
                              <span className="text-[#d91470] font-black bg-pink-50 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{s.resultString}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-gray-500 font-medium truncate max-w-[100px]">{s.wod?.name}</span>
                              <span className="font-bold text-[#27aae1]">Pos: {s.position}º | {s.points} pts</span>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteScore(s.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-colors text-xs">🗑️</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {scores.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-2">No hay puntuaciones cargadas</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}