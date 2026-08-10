'use client';

import React, { useState, useEffect } from 'react';

export default function LeaderboardPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [wods, setWods] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(1); // Por defecto Categoría 1 (Principiantes)

  // Cargar todos los datos necesarios al abrir la página
  useEffect(() => {
    fetch('https://competencias-ironbox-api.onrender.com/athletes')
      .then(res => res.json())
      .then(data => setAthletes(data))
      .catch(() => {});

    fetch('https://competencias-ironbox-api.onrender.com/wods')
      .then(res => res.json())
      .then(data => setWods(data))
      .catch(() => {});

    fetch('https://competencias-ironbox-api.onrender.com/scores')
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(() => {});
  }, []);

  // Filtrar atletas y WODs según la categoría seleccionada
  const filteredAthletes = athletes.filter(a => a.categoryId === Number(selectedCategory));
  const filteredWods = wods.filter(w => w.categoryId === Number(selectedCategory));

  // Calcular la tabla de posiciones por puntos totales para la categoría
  const leaderboardData = filteredAthletes.map(athlete => {
    // Buscar todas las puntuaciones de este atleta
    const athleteScores = scores.filter(s => s.athleteId === athlete.id);
    
    // Sumar los puntos totales de todos los WODs
    const totalPoints = athleteScores.reduce((sum, score) => sum + score.points, 0);

    return {
      ...athlete,
      scores: athleteScores,
      totalPoints,
    };
  });

  // Ordenar de mayor a menor puntaje (el que más puntos tiene va primero)
  leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <main className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-2 tracking-wider text-yellow-500">
          Tabla de Posiciones en Vivo
        </h1>

        {/* Botones para seleccionar Categoría */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {[
            { id: 1, name: 'Principiantes' },
            { id: 2, name: 'Scaled' },
            { id: 3, name: 'Advance' },
            { id: 4, name: 'RX' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-xl font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-gray-900 shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tabla de Clasificación */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-gray-400 border-b border-gray-700 text-sm uppercase">
                  <th className="p-4 text-center w-16">Pos</th>
                  <th className="p-4">Atleta</th>
                  <th className="p-4">Box</th>
                  {filteredWods.map(wod => (
                    <th key={wod.id} className="p-4 text-center">{wod.name}</th>
                  ))}
                  <th className="p-4 text-center text-yellow-500 font-bold">Total Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboardData.length === 0 ? (
                  <tr>
                    <td colSpan={5 + filteredWods.length} className="text-center p-8 text-gray-400">
                      No hay atletas registrados en esta categoría todavía.
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((athlete, index) => (
                    <tr key={athlete.id} className="hover:bg-gray-750 transition-colors">
                      <td className="p-4 text-center font-bold text-lg">
                        {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                      </td>
                      <td className="p-4 font-semibold text-white">{athlete.fullName}</td>
                      <td className="p-4 text-gray-400 text-sm">{athlete.boxName || 'Independiente'}</td>
                      
                      {/* Puntaje por cada WOD */}
                      {filteredWods.map(wod => {
                        const scoreEntry = athlete.scores.find((s: any) => s.wodId === wod.id);
                        return (
                          <td key={wod.id} className="p-4 text-center">
                            {scoreEntry ? (
                              <span className="bg-gray-700 px-2.5 py-1 rounded-md text-sm font-medium">
                                {scoreEntry.points} pts <span className="text-xs text-gray-400">(#{scoreEntry.position})</span>
                              </span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-4 text-center font-black text-yellow-400 text-lg">
                        {athlete.totalPoints}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}