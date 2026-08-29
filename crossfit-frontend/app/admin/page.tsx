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

  const [editingAthleteId, setEditingAthleteId] = useState<number | null>(null);
  const [editingWodId, setEditingWodId] = useState<number | null>(null);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [scoreFilter, setScoreFilter] = useState({ gender: '', categoryId: '' });
  const [mensaje, setMensaje] = useState('');
  const [expandedWodId, setExpandedWodId] = useState<number | null>(null);

  const [showAthleteForm, setShowAthleteForm] = useState(false); 
  const [showWodForm, setShowWodForm] = useState(false);       
  const [showScoreForm, setShowScoreForm] = useState(true);    

  const [showAthletesList, setShowAthletesList] = useState(true);
  const [showWodsList, setShowWodsList] = useState(true);
  const [showScoresList, setShowScoresList] = useState(true);

  const [activeSummaryCategoryId, setActiveSummaryCategoryId] = useState<number | null>(null);
  const [activeSummaryGender, setActiveSummaryGender] = useState<'MASCULINO' | 'FEMENINO'>('MASCULINO');

  const fetchData = () => {
    fetch('https://competencias-ironbox-api.onrender.com/categories').then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          if (!athleteForm.categoryId) setAthleteForm(prev => ({ ...prev, categoryId: data[0].id.toString() }));
          if (!wodForm.categoryId) setWodForm(prev => ({ ...prev, categoryId: data[0].id.toString() }));
          if (!activeSummaryCategoryId) setActiveSummaryCategoryId(data[0].id);
        }
      }).catch(() => {});
    fetch('https://competencias-ironbox-api.onrender.com/scores/freeze/status').then(res => res.json()).then(data => setIsFrozen(data.isFrozen)).catch(() => {});  
    fetch('https://competencias-ironbox-api.onrender.com/athletes').then(res => res.json()).then(data => setAthletes(data)).catch(() => {});
    fetch('https://competencias-ironbox-api.onrender.com/wods').then(res => res.json()).then(data => setWods(data)).catch(() => {});
    fetch('https://competencias-ironbox-api.onrender.com/scores').then(res => res.json()).then(data => setScores(data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleToggleFreeze = async () => {
    const newStatus = !isFrozen;
    const res = await fetch('https://competencias-ironbox-api.onrender.com/scores/freeze/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFrozen: newStatus })
    });
    if (res.ok) {
      setIsFrozen(newStatus);
      mostrarMensaje(newStatus ? '🔒 MODO SUSPENSO ACTIVADO (Tabla Oculta)' : '🔓 MODO SUSPENSO DESACTIVADO (Tabla Visible)');
    }
  };

  // ================= ATLETAS =================
  const handleSubmitAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingAthleteId ? 'PATCH' : 'POST';
    const url = editingAthleteId 
      ? `https://competencias-ironbox-api.onrender.com/athletes/${editingAthleteId}`
      : 'https://competencias-ironbox-api.onrender.com/athletes';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fullName: athleteForm.fullName, 
        boxName: athleteForm.boxName, 
        gender: athleteForm.gender,
        categoryId: Number(athleteForm.categoryId) 
      })
    });

    if (res.ok) {
      mostrarMensaje(editingAthleteId ? '¡Atleta actualizado correctamente!' : '¡Atleta registrado!');
      setAthleteForm({ fullName: '', boxName: '', gender: 'MASCULINO', categoryId: categories[0]?.id.toString() || '' });
      setEditingAthleteId(null);
      fetchData();
    } else {
      mostrarMensaje('Error al guardar el atleta.');
    }
  };

  const startEditAthlete = (a: any) => {
    setAthleteForm({ fullName: a.fullName, boxName: a.boxName || '', gender: a.gender, categoryId: a.categoryId.toString() });
    setEditingAthleteId(a.id);
    setShowAthleteForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= WODS =================
  const handleSubmitWod = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingWodId ? 'PATCH' : 'POST';
    const url = editingWodId 
      ? `https://competencias-ironbox-api.onrender.com/wods/${editingWodId}`
      : 'https://competencias-ironbox-api.onrender.com/wods';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wodForm.name, description: wodForm.description, type: wodForm.type, categoryId: Number(wodForm.categoryId) })
    });

    if (res.ok) {
      mostrarMensaje(editingWodId ? '¡WOD actualizado correctamente!' : '¡WOD creado!');
      setWodForm({ name: '', description: '', type: 'TIME', categoryId: categories[0]?.id.toString() || '' });
      setEditingWodId(null);
      fetchData();
    } else {
      mostrarMensaje('Error al guardar el WOD.');
    }
  };

  const startEditWod = (w: any) => {
    setWodForm({ name: w.name, description: w.description || '', type: w.type, categoryId: w.categoryId.toString() });
    setEditingWodId(w.id);
    setShowWodForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= PUNTUACIONES =================
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWod = wods.find(w => w.id === Number(scoreForm.wodId));
    if (!selectedWod) return mostrarMensaje('Debes seleccionar un WOD válido');

    let resultValue = 0, resultString = '';
    if (selectedWod.type === 'TIME') {
      const m = Number(scoreForm.minutes) || 0;
      const s = Number(scoreForm.seconds) || 0;
      resultValue = (m * 60) + s; 
      resultString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      resultValue = Number(scoreForm.result);
      resultString = `${resultValue} ${selectedWod.type === 'REPS' ? 'reps' : 'kg'}`;
    }

    const bodyData = {
      athleteId: Number(scoreForm.athleteId),
      wodId: Number(scoreForm.wodId),
      resultValue, 
      resultString
    };

    if (editingScoreId) {
      await fetch(`https://competencias-ironbox-api.onrender.com/scores/${editingScoreId}`, { method: 'DELETE' });
    }

    const res = await fetch('https://competencias-ironbox-api.onrender.com/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      mostrarMensaje(editingScoreId ? '¡Puntuación actualizada y ranking recalculado!' : '¡Puntuación cargada con éxito!');
      setScoreForm({ athleteId: '', wodId: '', minutes: '', seconds: '', result: '', observations: '' });
      setEditingScoreId(null);
      fetchData();
    } else {
      mostrarMensaje('Error al guardar la puntuación.');
    }
  };

  const startEditScore = (s: any) => {
    setScoreFilter({ gender: s.athlete?.gender || '', categoryId: s.wod?.categoryId?.toString() || '' });
    
    let m = '', sec = '', res = '';
    if (s.wod?.type === 'TIME') {
      m = Math.floor(s.resultValue / 60).toString();
      sec = (s.resultValue % 60).toString();
    } else {
      res = s.resultValue.toString();
    }

    setScoreForm({ athleteId: s.athleteId.toString(), wodId: s.wodId.toString(), minutes: m, seconds: sec, result: res, observations: '' });
    setEditingScoreId(s.id);
    setShowScoreForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= BORRADOS =================
  const handleDeleteAthlete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este atleta?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/athletes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };
  const handleDeleteWod = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este WOD?')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/wods/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };
  const handleDeleteScore = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta puntuación? Se recalculará la tabla.')) return;
    const res = await fetch(`https://competencias-ironbox-api.onrender.com/scores/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const currentWod = wods.find(w => w.id.toString() === scoreForm.wodId);
  const sortedAthletes = [...athletes].sort((a, b) => a.fullName.localeCompare(b.fullName));
  
  const filteredAthletes = sortedAthletes.filter(a => {
    const matchGender = scoreFilter.gender ? a.gender === scoreFilter.gender : false;
    const matchCategory = scoreFilter.categoryId ? a.categoryId.toString() === scoreFilter.categoryId : false;
    return matchGender && matchCategory;
  });
  const filteredWods = wods.filter(w => w.categoryId.toString() === scoreFilter.categoryId);

  const summaryAthletes = sortedAthletes.filter(a => a.categoryId === activeSummaryCategoryId && a.gender === activeSummaryGender);
  const summaryWods = wods.filter(w => w.categoryId === activeSummaryCategoryId);
  const summaryScores = scores.filter(s => s.wod?.categoryId === activeSummaryCategoryId && s.athlete?.gender === activeSummaryGender);

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#1a2b4c] focus:border-[#27aae1] focus:ring-1 focus:ring-[#27aae1] outline-none transition-all";
  const selectClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#1a2b4c] focus:border-[#27aae1] outline-none transition-all font-medium";
  const labelClass = "text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#eaf5fa] text-[#1a2b4c] p-4 md:p-8 font-sans">
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a2b4c] mb-8 text-center uppercase tracking-tight">
        Panel de <span className="text-[#d91470]">Administración</span>
      </h1>

      {/* BOTÓN MAESTRO: MODO SUSPENSO */}
      <div className="max-w-4xl mx-auto flex justify-center mb-8">
        <button 
          onClick={handleToggleFreeze}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition-all transform hover:scale-105 ${
            isFrozen ? 'bg-[#d91470] shadow-[#d91470]/40' : 'bg-[#1a2b4c] shadow-[#1a2b4c]/40'
          }`}
        >
          {isFrozen ? '🔒 Quitar Modo Suspenso (Mostrar Tabla)' : '🛑 Activar Modo Suspenso (Ocultar Tabla)'}
        </button>
      </div>

      {mensaje && (
        <div className="max-w-4xl mx-auto bg-[#27aae1] text-white p-4 rounded-xl mb-8 text-center font-bold shadow-lg animate-pulse">
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start max-w-7xl mx-auto">
        
        {/* Atleta Form */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all ${editingAthleteId ? 'border-2 border-yellow-400' : 'border border-gray-100'}`}>
            <button type="button" onClick={() => setShowAthleteForm(!showAthleteForm)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-extrabold text-[#1a2b4c]">
                {editingAthleteId ? '✏️ Editando Atleta' : '1. Registrar Atleta'}
              </h2>
              <span className="text-[#27aae1] text-xl">{showAthleteForm ? '🔼' : '🔽'}</span>
            </button>
            {showAthleteForm && (
              <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                <form onSubmit={handleSubmitAthlete} className="flex flex-col gap-4 mt-4">
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
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className={`flex-1 text-white p-3 rounded-xl font-bold transition shadow-md ${editingAthleteId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#1a2b4c] hover:bg-[#1a2b4c]/90'}`}>
                      {editingAthleteId ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editingAthleteId && (
                      <button type="button" onClick={() => { setEditingAthleteId(null); setAthleteForm({ fullName: '', boxName: '', gender: 'MASCULINO', categoryId: categories[0]?.id.toString() || '' }); }} className="bg-gray-200 text-gray-600 px-4 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                    )}
                  </div>
                </form>
              </div>
            )}
        </div>

        {/* WOD Form */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all ${editingWodId ? 'border-2 border-yellow-400' : 'border border-gray-100'}`}>
            <button type="button" onClick={() => setShowWodForm(!showWodForm)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-extrabold text-[#1a2b4c]">
                {editingWodId ? '✏️ Editando WOD' : '2. Crear WOD'}
              </h2>
              <span className="text-[#27aae1] text-xl">{showWodForm ? '🔼' : '🔽'}</span>
            </button>
            {showWodForm && (
              <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                <form onSubmit={handleSubmitWod} className="flex flex-col gap-4 mt-4">
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
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className={`flex-1 text-white p-3 rounded-xl font-bold transition shadow-md ${editingWodId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#1a2b4c] hover:bg-[#1a2b4c]/90'}`}>
                      {editingWodId ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editingWodId && (
                      <button type="button" onClick={() => { setEditingWodId(null); setWodForm({ name: '', description: '', type: 'TIME', categoryId: categories[0]?.id.toString() || '' }); }} className="bg-gray-200 text-gray-600 px-4 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                    )}
                  </div>
                </form>
              </div>
            )}
        </div>

        {/* Score Form */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all ${editingScoreId ? 'border-2 border-yellow-400' : 'border-t-4 border-t-[#d91470]'}`}>
            <button type="button" onClick={() => setShowScoreForm(!showScoreForm)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-extrabold text-[#1a2b4c]">
                {editingScoreId ? '✏️ Editando Puntaje' : '3. Carga de Puntos'}
              </h2>
              <span className="text-[#d91470] text-xl">{showScoreForm ? '🔼' : '🔽'}</span>
            </button>
            {showScoreForm && (
              <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                <form onSubmit={handleSubmitScore} className="flex flex-col gap-4 mt-4">
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
                      <select className={selectClass} value={scoreFilter.categoryId} onChange={e => { setScoreFilter({ ...scoreFilter, categoryId: e.target.value }); setScoreForm({ ...scoreForm, athleteId: '', wodId: '' }); }} required>
                        <option value="">Seleccionar...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>3. Atleta</label>
                    <select className={selectClass} value={scoreForm.athleteId} onChange={e => { setScoreForm({ ...scoreForm, athleteId: e.target.value, wodId: '', minutes: '', seconds: '', result: '' }); }} required>
                      <option value="">{scoreFilter.categoryId ? 'Seleccionar Atleta...' : 'Filtra arriba primero'}</option>
                      {filteredAthletes.map(a => <option key={a.id} value={a.id}>{a.fullName} {a.boxName ? `(${a.boxName})` : ''}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className={labelClass}>4. Seleccionar WOD</label>
                    <select className={selectClass} value={scoreForm.wodId} onChange={e => setScoreForm({...scoreForm, wodId: e.target.value, minutes: '', seconds: '', result: ''})} required>
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
                  
                  <div className="flex gap-2 mt-2">
                    <button type="submit" disabled={!currentWod} className={`flex-1 p-3 rounded-xl font-extrabold transition shadow-md ${currentWod ? (editingScoreId ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-[#d91470] hover:bg-[#b0105a] text-white') : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                      {currentWod ? (editingScoreId ? 'Corregir Puntaje' : 'Guardar Puntaje') : 'Esperando...'}
                    </button>
                    {editingScoreId && (
                      <button type="button" onClick={() => { setEditingScoreId(null); setScoreForm({ athleteId: '', wodId: '', minutes: '', seconds: '', result: '', observations: '' }); }} className="bg-gray-200 text-gray-600 px-4 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                    )}
                  </div>
                </form>
              </div>
            )}
        </div>
      </div>

      <hr className="border-gray-200 mb-8 max-w-7xl mx-auto" />

      {/* FILTROS Y RESUMEN */}
      <h2 className="text-2xl font-extrabold text-center mb-6 text-[#1a2b4c] uppercase tracking-wide">
        Resumen de Datos Cargados
      </h2>
      <div className="flex flex-wrap justify-center gap-3 mb-4 max-w-7xl mx-auto">
        {categories.map(category => (
          <button key={category.id} onClick={() => setActiveSummaryCategoryId(category.id)} className={`px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${activeSummaryCategoryId === category.id ? 'bg-[#1a2b4c] text-white border-[#1a2b4c] shadow-lg scale-105' : 'bg-white text-[#1a2b4c] border-gray-300 hover:border-[#27aae1]'}`}>{category.name}</button>
        ))}
      </div>
      <div className="flex justify-center gap-4 mb-8 max-w-7xl mx-auto">
        <button onClick={() => setActiveSummaryGender('MASCULINO')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${activeSummaryGender === 'MASCULINO' ? 'bg-[#27aae1] border-[#27aae1] text-white shadow-md' : 'bg-white border-gray-300 text-gray-500 hover:border-[#27aae1]'}`}>🚹 Masculino</button>
        <button onClick={() => setActiveSummaryGender('FEMENINO')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${activeSummaryGender === 'FEMENINO' ? 'bg-[#d91470] border-[#d91470] text-white shadow-md' : 'bg-white border-gray-300 text-gray-500 hover:border-[#d91470]'}`}>🚺 Femenino</button>
      </div>
      
      {/* LISTAS FILTRADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        
        {/* Atletas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowAthletesList(!showAthletesList)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-extrabold text-lg text-[#1a2b4c] flex items-center gap-2">🏃 Atletas <span className="bg-[#eaf5fa] text-[#27aae1] text-xs px-2 py-1 rounded-full">{summaryAthletes.length}</span></h3>
            <span className="text-[#27aae1] text-xl">{showAthletesList ? '🔼' : '🔽'}</span>
          </button>
          {showAthletesList && (
            <div className="p-5 pt-0 border-t border-gray-100 mt-2 overflow-auto max-h-[600px] scrollbar-hide">
              <ul className="flex flex-col gap-2 mt-2">
                {summaryAthletes.map(a => (
                  <li key={a.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-[#27aae1]/30 transition">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1"><span className="font-bold text-[#1a2b4c] text-sm">{a.fullName}</span></div>
                      <span className="text-gray-500 text-xs truncate max-w-[150px]">{a.boxName || 'Independiente'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditAthlete(a)} className="bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white p-2 rounded-lg transition-colors text-xs">✏️</button>
                      <button onClick={() => handleDeleteAthlete(a.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors text-xs">🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* WODs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowWodsList(!showWodsList)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-extrabold text-lg text-[#1a2b4c] flex items-center gap-2">🏋️ WODs <span className="bg-[#eaf5fa] text-[#27aae1] text-xs px-2 py-1 rounded-full">{summaryWods.length}</span></h3>
            <span className="text-[#27aae1] text-xl">{showWodsList ? '🔼' : '🔽'}</span>
          </button>
          {showWodsList && (
            <div className="p-5 pt-0 border-t border-gray-100 mt-2 overflow-auto max-h-[600px] scrollbar-hide">
              <ul className="flex flex-col gap-2 mt-2">
                {summaryWods.map(w => (
                  <li key={w.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col hover:border-[#27aae1]/30 transition">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col gap-1">
                        <strong className="text-[#1a2b4c] text-sm leading-tight">{w.name}</strong>
                        <span className="text-[#d91470] font-bold text-[10px] uppercase bg-pink-50 px-2 py-0.5 rounded inline-block w-max mt-1">{w.type === 'TIME' ? '⏱️ Tiempo' : w.type === 'REPS' ? '🔄 AMRAP' : '🏋️ Peso'}</span>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => setExpandedWodId(expandedWodId === w.id ? null : w.id)} className="bg-[#eaf5fa] text-[#27aae1] hover:bg-[#27aae1] hover:text-white p-1.5 rounded-lg transition-colors text-xs">{expandedWodId === w.id ? '🔼' : 'ℹ️'}</button>
                        <button onClick={() => startEditWod(w)} className="bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white p-1.5 rounded-lg transition-colors text-xs">✏️</button>
                        <button onClick={() => handleDeleteWod(w.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-colors text-xs">🗑️</button>
                      </div>
                    </div>
                    {expandedWodId === w.id && (<div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-[#27aae1] text-gray-600 text-xs shadow-inner whitespace-pre-wrap font-medium">{w.description || <span className="italic text-gray-400">Sin descripción</span>}</div>)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Puntuaciones */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowScoresList(!showScoresList)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-extrabold text-lg text-[#1a2b4c] flex items-center gap-2">📝 Puntuaciones <span className="bg-[#eaf5fa] text-[#27aae1] text-xs px-2 py-1 rounded-full">{summaryScores.length}</span></h3>
            <span className="text-[#27aae1] text-xl">{showScoresList ? '🔼' : '🔽'}</span>
          </button>
          {showScoresList && (
            <div className="p-5 pt-0 border-t border-gray-100 mt-2 overflow-auto max-h-[600px] scrollbar-hide">
              <ul className="flex flex-col gap-2 mt-2">
                {summaryScores.map(s => (
                  <li key={s.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-[#27aae1]/30 transition">
                    <div className="flex flex-col w-full mr-3 gap-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1"><span className="font-bold text-[#1a2b4c] text-sm truncate max-w-[120px]">{s.athlete?.fullName}</span></div>
                        <span className="text-[#d91470] font-black bg-pink-50 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">{s.resultString}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500 font-medium truncate max-w-[100px]">{s.wod?.name}</span>
                        <span className="font-bold text-[#27aae1]">Pos: {s.position}º | {s.points} pts</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-col">
                      <button onClick={() => startEditScore(s)} className="bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white p-1.5 rounded-lg transition-colors text-xs">✏️</button>
                      <button onClick={() => handleDeleteScore(s.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-colors text-xs">🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}