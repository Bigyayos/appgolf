import React, { useState, useEffect } from 'react';
import { Users, Calendar, Trophy } from 'lucide-react';
import PlayerForm from './components/PlayerForm';
import PlayerProfile from './components/PlayerProfile';
import ConfirmDialog from './components/ConfirmDialog';
import TournamentList from './components/TournamentList'; // Nueva importación
import { api } from './services/api';

const GolfDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [playerData, setPlayerData] = useState(null);
  const [playerRanking, setPlayerRanking] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    console.log('Cargando datos para usuario:', user);
    
    try {
      const playersResponse = await api.getPlayers();
      console.log('Respuesta de getPlayers:', playersResponse);
      
      const currentPlayer = playersResponse.find(p => p.name === user);
      console.log('Jugador encontrado:', currentPlayer);
      
      if (!currentPlayer) {
        console.error('No se encontró el jugador en la lista');
        throw new Error(`No se encontró el jugador ${user} en la lista`);
      }
      
      setPlayerData(currentPlayer);
      
      const rankingResponse = await api.getRankings();
      console.log('Respuesta de getRankings:', rankingResponse);
      
      const rank = rankingResponse.findIndex(p => p.name === user) + 1;
      console.log('Posición en el ranking:', rank);
      setPlayerRanking(rank);
      
    } catch (err) {
      console.error('Error detallado:', err);
      setError(`Error al cargar los datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-xl">Cargando datos del jugador...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button 
          onClick={loadInitialData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-xl text-yellow-600">
          No se encontraron datos para el jugador: {user}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Pestañas */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Mi Perfil
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === 'tournaments' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            <Trophy className="h-4 w-4" />
            Torneos
          </button>
          <button
            onClick={() => setActiveTab('seasons')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === 'seasons' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Temporadas
          </button>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-lg shadow-lg">
          {activeTab === 'profile' && playerData && (
            <PlayerProfile player={playerData} ranking={playerRanking} />
          )}
          
          {activeTab === 'tournaments' && (
            <TournamentList /> // Nuevo componente añadido
          )}
          
          {activeTab === 'seasons' && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Mis Temporadas</h3>
              <p>Sección de temporadas en construcción...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showPlayerForm && (
        <PlayerForm 
          onSubmit={handlePlayerSubmit} 
          onClose={() => setShowPlayerForm(false)} 
        />
      )}
      
      {deleteConfirmation && (
        <ConfirmDialog
          message={deleteConfirmation.message}
          onConfirm={deleteConfirmation.onConfirm}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
};

export default GolfDashboard;
