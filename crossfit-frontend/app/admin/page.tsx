'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [wods, setWods] = useState<any[]>([]);

  // Estados para los formularios
  const [athleteForm, setAthleteForm] = useState({ fullName: '', boxName: '', categoryId: '' });
  const [wodForm, setWodForm] = useState({ name: '', description: '', categoryId: '' });
  const [scoreForm, setScoreForm] = useState({ athleteId: '', wodId: '', position: '', points: '', observations: '' });

  const [mensaje, setMensaje] = useState('');

  // Cargar categorías, atletas y wods al iniciar la página
  useEffect(() => {
    // Endpoint para obtener las categorías
    fetch('https://competencias-ironbox-api.onrender.com/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        // Si hay categorías, seleccionamos la primera por defecto para el formulario
        if (data.length > 0) {
          setAthleteForm(prev => ({ ...prev, categoryId: data[0].id.toString() }));
          setWodForm(prev => ({ ...prev, categoryId: data[0].id.toString() }));
        }
      })
      .catch(() => {});

    fetch('https://competencias-ironbox-api.onrender.com/athletes').then(res => res.json()).then(data => setAthletes(data)).catch(() => {});
    fetch('https://competencias-ironbox-api.onrender.com/wods').then(res => res.json()).then(data => setWods(data)).catch(() => {});
  }, []);

  // 1. Registrar Atleta
  const handleCreateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('https://competencias-ironbox-api.onrender.com/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fullName: athleteForm.fullName, 
        boxName: athleteForm.boxName, 
        categoryId: Number(athleteForm.categoryId) 
      })
    });
    if (res.ok) {
      setMensaje('¡Atleta registrado con éxito!');
      setAthleteForm({ fullName: '', boxName: '', categoryId: categories[0]?.id.toString() || '' });
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
      body: JSON.stringify({ 
        name: wodForm.name, 
        description: wodForm.description, 
        categoryId: Number(wodForm.categoryId) 
      })
    });
    if (res.ok) {
      setMensaje('¡WOD creado con éxito!');
      setWodForm({ name: '', description: '', categoryId: categories[0]?.id.toString() || '' });
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
    } else {
      setMensaje('Error al cargar puntuación');
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-black text-center mb-8 text-blue-600">
        PANEL DE ADMINISTRACIÓN - IRONBOX
      </h1>

      {mensaje && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center font-semibold">
          {mensaje}
        </div>
      )}

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Registrar Atleta */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Registrar Atleta</h2>
          <form onSubmit={handleCreateAthlete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre Completo</label>
              <input 
                type="text" 
                required
                className="w-full mt-1 p-2 border rounded-lg"
                value={athleteForm.fullName}
                onChange={e => setAthleteForm({ ...athleteForm, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Box (Opcional)</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border rounded-lg"
                value={athleteForm.boxName}
                onChange={e => setAthleteForm({ ...athleteForm, boxName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Categoría</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white"
                value={athleteForm.categoryId}
                onChange={e => setAthleteForm({ ...athleteForm, categoryId: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700">
              Guardar Atleta
            </button>
          </form>
        </div>

        {/* Crear WOD */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Crear WOD</h2>
          <form onSubmit={handleCreateWod} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre del WOD</label>
              <input 
                type="text" 
                required
                className="w-full mt-1 p-2 border rounded-lg"
                value={wodForm.name}
                onChange={e => setWodForm({ ...wodForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Descripción</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border rounded-lg"
                value={wodForm.description}
                onChange={e => setWodForm({ ...wodForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Categoría</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white"
                value={wodForm.categoryId}
                onChange={e => setWodForm({ ...wodForm, categoryId: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700">
              Crear WOD
            </button>
          </form>
        </div>

      </div>

      {/* Cargar Puntuaciones */}
      <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Cargar Puntuación / Resultado</h2>
        <form onSubmit={handleCreateScore} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">ID de Atleta</label>
            <input 
              type="number" 
              required
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Ej: 1"
              value={scoreForm.athleteId}
              onChange={e => setScoreForm({ ...scoreForm, athleteId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ID de WOD</label>
            <input 
              type="number" 
              required
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Ej: 1"
              value={scoreForm.wodId}
              onChange={e => setScoreForm({ ...scoreForm, wodId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Posición</label>
            <input 
              type="number" 
              required
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Ej: 1"
              value={scoreForm.position}
              onChange={e => setScoreForm({ ...scoreForm, position: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Puntos</label>
            <input 
              type="number" 
              required
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Ej: 100"
              value={scoreForm.points}
              onChange={e => setScoreForm({ ...scoreForm, points: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Observaciones (Desempates, etc.)</label>
            <input 
              type="text" 
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Opcional"
              value={scoreForm.observations}
              onChange={e => setScoreForm({ ...scoreForm, observations: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700">
              Guardar Puntuación
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}