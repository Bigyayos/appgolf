// src/components/PlayerProfile.jsx
import React from 'react';
import { Trophy, Target, Award, Calendar } from 'lucide-react';

const PlayerProfile = ({ player, ranking }) => {
  return (
    <div className="p-6">
      {/* Información del jugador */}
      <div className="bg-blue-500 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold">{player.name}</h2>
        <p className="opacity-90">ID de Jugador: {player._id}</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-3 gap-4 bg-white p-6 shadow-lg">
        <div className="text-center">
          <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <h3 className="text-2xl font-bold">{player.handicap?.toFixed(1) || 'N/A'}</h3>
          <p className="text-sm text-gray-600">Hándicap</p>
        </div>
        
        <div className="text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <h3 className="text-2xl font-bold">{player.victories || 0}</h3>
          <p className="text-sm text-gray-600">Victorias</p>
        </div>
        
        <div className="text-center">
          <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <h3 className="text-2xl font-bold">#{ranking || 'N/A'}</h3>
          <p className="text-sm text-gray-600">Ranking</p>
        </div>
      </div>

      {/* Torneos y temporadas recientes */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Últimos Torneos
          </h3>
          {player.tournaments?.length > 0 ? (
            <div className="space-y-3">
              {player.tournaments.map((tournament, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="font-medium">{tournament.name}</p>
                  <p className="text-sm text-gray-600">{tournament.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay torneos registrados</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Temporadas Activas
          </h3>
          {player.seasons?.length > 0 ? (
            <div className="space-y-3">
              {player.seasons.map((season, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="font-medium">{season.name}</p>
                  <p className="text-sm text-gray-600">
                    {season.start_date} - {season.end_date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay temporadas activas</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
