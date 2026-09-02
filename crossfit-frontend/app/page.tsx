'use client';

import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeGender, setActiveGender] = useState<'MASCULINO' | 'FEMENINO'>('MASCULINO');
  const [expandedAthlete, setExpandedAthlete] = useState<number | null>(null);

  const [isFrozen, setIsFrozen] = useState(false);
  
  // NUEVO: Estado para saber si está cargando
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      fetch('https://competencias-ironbox-api.onrender.com/categories').then(res => res.json()),
      fetch('https://competencias-ironbox-api.onrender.com/athletes').then(res => res.json()),
      fetch('https://competencias-ironbox-api.onrender.com/scores').then(res => res.json()),
      fetch('https://competencias-ironbox-api.onrender.com/scores/freeze/status').then(res => res.json())
    ]).then(([catsData, athsData, scoresData, freezeData]) => {
      setCategories(catsData);
      setAthletes(athsData);
      setScores(scoresData);
      setIsFrozen(freezeData?.isFrozen || false);
      
      // Apagamos la pantalla de carga cuando llegan los datos
      setIsLoading(false);
    }).catch(error => {
      console.error("Error cargando:", error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); 
    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    if (categories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // NUEVO: Si está cargando, mostramos esta pantalla a pantalla completa
 if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#eaf5fa] text-[#1a2b4c] font-sans p-4">
        <div className="relative w-24 h-24 mb-8">
          {/* Círculo giratorio */}
          <div className="absolute inset-0 border-8 border-[#27aae1]/20 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-[#d91470] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-[#1a2b4c] text-center animate-pulse">
          Cargando resultados
        </h2>
      </div>
    );
  }

  const leaderboard = athletes
    .filter(a => a.categoryId === activeCategoryId && a.gender === activeGender)
    .map(athlete => {
      const athleteScores = scores.filter(s => s.athleteId === athlete.id);
      const totalPoints = athleteScores.reduce((sum, currentScore) => sum + (currentScore.points || 0), 0);
      return { ...athlete, totalPoints, athleteScores };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="min-h-screen flex flex-col bg-[#eaf5fa] text-[#1a2b4c] font-sans">
      <div className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center mb-10 mt-4 relative">
          
          <div className="flex justify-center items-center gap-6 md:gap-12 mb-6 bg-white p-4 rounded-3xl shadow-md border-2 border-[#27aae1]/20 mt-4 md:mt-0">
            <img src="/logo-ironbox.jpeg" alt="Iron Box" className="h-16 md:h-24 object-contain rounded-xl" />
            <div className="h-16 w-px bg-gray-300"></div>
            <img src="/logo-atodacosta.png" alt="A Toda Costa" className="h-20 md:h-28 object-contain" />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a2b4c] mb-8 tracking-tight text-center uppercase">
            Competencia <span className="text-[#d91470]">Crosstime</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${
                  activeCategoryId === category.id 
                    ? 'bg-[#1a2b4c] text-white border-[#1a2b4c] shadow-lg scale-105' 
                    : 'bg-white text-[#1a2b4c] border-gray-300 hover:border-[#27aae1]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setActiveGender('MASCULINO')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${
                activeGender === 'MASCULINO' 
                  ? 'bg-[#27aae1] border-[#27aae1] text-white shadow-md' 
                  : 'bg-white border-gray-300 text-gray-500 hover:border-[#27aae1] hover:text-[#27aae1]'
              }`}
            >
              🚹 Masculino
            </button>
            <button 
              onClick={() => setActiveGender('FEMENINO')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${
                activeGender === 'FEMENINO' 
                  ? 'bg-[#d91470] border-[#d91470] text-white shadow-md' 
                  : 'bg-white border-gray-300 text-gray-500 hover:border-[#d91470] hover:text-[#d91470]'
              }`}
            >
              🚺 Femenino
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="grid grid-cols-12 gap-4 p-4 bg-[#1a2b4c] text-white text-xs md:text-sm font-bold uppercase tracking-wider">
            <div className="col-span-2 md:col-span-1 text-center">POS</div>
            <div className="col-span-6 md:col-span-5">ATLETA</div>
            <div className="col-span-0 md:col-span-4 hidden md:block text-center">BOX</div>
            <div className="col-span-4 md:col-span-2 text-right pr-4">TOTAL PTS</div>
          </div>

          <div className="divide-y divide-gray-100">
            {isFrozen ? (
              <div className="p-16 text-center bg-[#1a2b4c] text-white">
                <div className="text-6xl mb-6">🤫</div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest mb-4">
                  Modo <span className="text-[#d91470]">Suspenso</span> Activado
                </h2>
                <p className="text-gray-300 md:text-lg max-w-lg mx-auto">
                  Los resultados de esta categoría han sido ocultados temporalmente mientras se define la competencia.
                </p>
                <div className="mt-8 text-[#27aae1] font-bold uppercase tracking-[0.2em] animate-pulse">
                  ¡Nos vemos en la premiación!
                </div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic font-medium">
                Aún no hay atletas registrados en esta categoría.
              </div>
            ) : (
              leaderboard.map((athlete, index) => {
                const position = index + 1;
                const isExpanded = expandedAthlete === athlete.id;
                
                let posColor = "text-gray-400 font-bold";
                if (position === 1) posColor = "text-[#d91470] font-black text-xl"; 
                if (position === 2) posColor = "text-[#27aae1] font-bold text-lg";  
                if (position === 3) posColor = "text-[#1a2b4c] font-bold text-lg";  

                return (
                  <div key={athlete.id} className="flex flex-col">
                    <div onClick={() => setExpandedAthlete(isExpanded ? null : athlete.id)} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#eaf5fa]/50 cursor-pointer transition-colors">
                      <div className={`col-span-2 md:col-span-1 text-center ${posColor}`}>{position}º</div>
                      <div className="col-span-6 md:col-span-5 font-bold text-[#1a2b4c] truncate">
                        {athlete.fullName}
                        <div className="md:hidden text-xs text-gray-500 font-normal mt-1">{athlete.boxName || 'Independiente'}</div>
                      </div>
                      <div className="col-span-0 md:col-span-4 hidden md:block text-center text-sm text-gray-500 font-medium">{athlete.boxName || 'Independiente'}</div>
                      <div className="col-span-4 md:col-span-2 text-right pr-4 font-black text-[#27aae1] text-lg">{athlete.totalPoints}</div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50 p-4 border-l-4 border-[#d91470] text-sm shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {athlete.athleteScores.length > 0 ? (
                            athlete.athleteScores.map((score: any) => (
                              <div key={score.id} className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm border border-gray-100">
                                <div>
                                  <span className="text-[#1a2b4c] font-bold text-xs uppercase tracking-wider block mb-1">{score.wod?.name || 'WOD'}</span>
                                  <span className="text-gray-600">Res: <strong className="text-[#d91470]">{score.resultString}</strong> (Pos: {score.position}º)</span>
                                </div>
                                <div className="text-lg font-bold text-[#27aae1]">+{score.points} pts</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 italic col-span-2">Aún no tiene resultados cargados.</div>
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

      <div className="w-full mt-auto">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto block -mb-1">
          <path fill="#00a3a7" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,96C672,75,768,85,864,112C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <div className="bg-[#00a3a7] h-8 md:h-16 w-full"></div>
      </div>
    </div>
  );
}