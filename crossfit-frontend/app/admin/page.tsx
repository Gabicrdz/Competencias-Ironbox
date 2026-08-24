'use client';

import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [expandedAthlete, setExpandedAthlete] = useState<number | null>(null);

  useEffect(() => {
    // Descargamos todo al entrar a la página
    Promise.all([
      fetch('https://competencias-ironbox-api.onrender.com/categories').then(res => res.json()),
      fetch('https://competencias-ironbox-api.onrender.com/athletes').then(res => res.json()),
      fetch('https://competencias-ironbox-api.onrender.com/scores').then(res => res.json())
    ]).then(([catsData, athsData, scoresData]) => {
      setCategories(catsData);
      setAthletes(athsData);
      setScores(scoresData);
      
      // Seleccionar la primera categoría por defecto si existe
      if (catsData.length > 0) {
        setActiveCategoryId(catsData[0].id);
      }
    }).catch(error => console.error("Error cargando los datos:", error));
  }, []);

  // 🧮 CÁLCULO DE LA TABLA DE POSICIONES
  // 1. Filtramos los atletas por la categoría seleccionada
  // 2. Sumamos todos sus puntos
  // 3. Los ordenamos de mayor a menor puntaje
  const leaderboard = athletes
    .filter(a => a.categoryId === activeCategoryId)
    .map(athlete => {
      const athleteScores = scores.filter(s => s.athleteId === athlete.id);
      const totalPoints = athleteScores.reduce((sum, currentScore) => sum + (currentScore.points || 0), 0);
      return { ...athlete, totalPoints, athleteScores };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints); // Ordenar de mayor a menor

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans">
      
      {/* ENCABEZADO */}
      <div className="text-center mb-10 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-500 mb-6 tracking-wide drop-shadow-md">
          Tabla de Posiciones en Vivo
        </h1>
        
        {/* PESTAÑAS DE CATEGORÍAS */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg ${
                activeCategoryId === category.id 
                  ? 'bg-yellow-500 text-slate-900 scale-105' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="max-w-4xl mx-auto bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Cabecera de la tabla */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-800 border-b border-slate-700 text-xs md:text-sm font-bold text-yellow-500 uppercase tracking-wider">
          <div className="col-span-2 md:col-span-1 text-center">POS</div>
          <div className="col-span-6 md:col-span-5">ATLETA</div>
          <div className="col-span-0 md:col-span-4 hidden md:block text-center">BOX</div>
          <div className="col-span-4 md:col-span-2 text-right pr-4">TOTAL PTS</div>
        </div>

        {/* Lista de Atletas */}
        <div className="divide-y divide-slate-700/50">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic">
              No hay atletas registrados en esta categoría todavía.
            </div>
          ) : (
            leaderboard.map((athlete, index) => {
              const position = index + 1;
              const isExpanded = expandedAthlete === athlete.id;
              
              // Colores especiales para el podio (Top 3)
              let posColor = "text-slate-400";
              if (position === 1) posColor = "text-yellow-400 font-extrabold text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]";
              if (position === 2) posColor = "text-gray-300 font-bold text-lg";
              if (position === 3) posColor = "text-amber-600 font-bold text-lg";

              return (
                <div key={athlete.id} className="flex flex-col">
                  {/* Fila del Atleta (Clicleable) */}
                  <div 
                    onClick={() => setExpandedAthlete(isExpanded ? null : athlete.id)}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className={`col-span-2 md:col-span-1 text-center ${posColor}`}>
                      {position}º
                    </div>
                    <div className="col-span-6 md:col-span-5 font-bold text-slate-100 truncate">
                      {athlete.fullName}
                      <div className="md:hidden text-xs text-slate-400 font-normal mt-1">{athlete.boxName || 'Independiente'}</div>
                    </div>
                    <div className="col-span-0 md:col-span-4 hidden md:block text-center text-sm text-slate-400">
                      {athlete.boxName || 'Independiente'}
                    </div>
                    <div className="col-span-4 md:col-span-2 text-right pr-4 font-black text-yellow-500 text-lg">
                      {athlete.totalPoints}
                    </div>
                  </div>

                  {/* Detalle Expandible (El toque de lujo) */}
                  {isExpanded && (
                    <div className="bg-slate-900/80 p-4 border-l-4 border-yellow-500 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {athlete.athleteScores.length > 0 ? (
                         athlete.athleteScores.map((score: any) => (
                            <div key={score.id} className="bg-slate-800 rounded p-3 flex justify-between items-center shadow-inner">
                              <div>
                                <span className="text-yellow-500 font-bold text-xs uppercase tracking-wider block mb-1">
                                  {score.wod?.name || 'WOD'}
                                </span>
                                <span className="text-slate-300">Res: <strong>{score.resultString}</strong> (Pos: {score.position}º)</span>
                              </div>
                              <div className="text-lg font-bold text-green-400">
                                +{score.points} pts
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic col-span-2">Aún no tiene resultados cargados.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}