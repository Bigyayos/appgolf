import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Flag, Plus, Calendar, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import TournamentForm from './TournamentForm';

const TournamentList = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Obtiene los datos del usuario y su rol desde localStorage
  const { user, role } = JSON.parse(localStorage.getItem('authUser') || '{}');
  const isSuperAdmin = role === 'superadmin';

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await api.getTournaments();
      setTournaments(data);
    } catch (err) {
      setError('Error al cargar los torneos');
      console.error('Error:', err);
      if (err.message.includes('Token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este torneo?')) {
      try {
        await api.deleteTournament(tournamentId);
        await loadTournaments();
        alert('Torneo eliminado con éxito');
      } catch (err) {
        alert('Error al eliminar el torneo');
        console.error('Error:', err);
        if (err.message.includes('Token')) {
          navigate('/login');
        }
      }
    }
  };

  const handleRegister = async (tournamentId) => {
    try {
      await api.registerForTournament(tournamentId);
      await loadTournaments();
      alert('Registro exitoso');
    } catch (err) {
      alert('Error al registrarse en el torneo');
      console.error('Error:', err);
      if (err.message.includes('Token')) {
        navigate('/login');
      }
    }
  };

  const handleCreateTournament = async (tournamentData) => {
    try {
      await api.createTournament(tournamentData);
      await loadTournaments();
      setShowForm(false);
    } catch (err) {
      alert('Error al crear el torneo');
      console.error('Error:', err);
      if (err.message.includes('Token')) {
        navigate('/login');
      }
    }
  };

  const handleViewDetails = (tournamentId) => {
    navigate(`/tournament/${tournamentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Cargando torneos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Torneos</h2>
        {isSuperAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Torneo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div key={tournament._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold">{tournament.name}</h3>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => handleDeleteTournament(tournament._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Eliminar torneo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(tournament.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{tournament.players?.length || 0} jugadores</span>
              </div>

              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                <span>
                  CR: {tournament.course_rating} | SR: {tournament.slope_rating}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleRegister(tournament._id)}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Inscribirse
              </button>
              <button
                onClick={() => handleViewDetails(tournament._id)}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {isSuperAdmin && showForm && (
        <TournamentForm
          onSubmit={handleCreateTournament}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default TournamentList;
