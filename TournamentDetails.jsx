import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Flag, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [scoringMode, setScoringMode] = useState('medal'); // 'medal' o 'stableford'
  const [viewMode, setViewMode] = useState('gross');

  // Obtener rol de usuario del localStorage
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const isSuperAdmin = authUser.role === 'superadmin';

  useEffect(() => {
    loadTournamentDetails();
    if (isSuperAdmin) {
      loadAllPlayers();
    }
  }, [id]);

  const loadTournamentDetails = async () => {
    try {
      const data = await api.getTournamentDetails(id);
      setTournament(data);
    } catch (err) {
      setError('Error al cargar los detalles del torneo');
      console.error('Error:', err);
      if (err.message.includes('Token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllPlayers = async () => {
    try {
      const playersData = await api.getPlayers();
      setPlayers(playersData);
    } catch (err) {
      console.error('Error cargando jugadores:', err);
    }
  };

  const calculateStablefordPoints = (grossScore, par, handicap) => {
    const netScore = grossScore - handicap;
    const difference = netScore - par;
    
    if (difference <= -2) return 4;      // Eagle o mejor
    if (difference === -1) return 3;     // Birdie
    if (difference === 0) return 2;      // Par
    if (difference === 1) return 1;      // Bogey
    return 0;                            // Double bogey o peor
  };

  const getPlayerStablefordPoints = (result) => {
    const player = players.find(p => p.name === result.player_name);
    const handicap = player ? player.handicap : 0;
    return calculateStablefordPoints(
      result.gross_score, 
      tournament.par || 72,
      handicap
    );
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    try {
      if (isSuperAdmin) {
        await api.submitTournamentResults(id, {
          player_name: selectedPlayer,
          gross_score: parseFloat(score),
          scoring_mode: scoringMode
        });
      } else {
        await api.submitTournamentResult(id, parseFloat(score));
      }
      await loadTournamentDetails();
      setScore('');
      setSelectedPlayer('');
      alert('Resultado registrado exitosamente');
    } catch (err) {
      alert('Error al registrar el resultado');
      console.error('Error:', err);
    }
  };

const renderResultsTable = () => {
  if (!tournament.results || tournament.results.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Jugador
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Score Bruto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Puntos Stableford
            </th>
            {isSuperAdmin && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Registrado por
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tournament.results.map((result, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {result.player_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {result.gross_score}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {result.stableford_points} pts
              </td>
              {isSuperAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.submitted_by || "No registrado"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  if (loading) return <div>Cargando detalles...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tournament) return <div>Torneo no encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/tournaments')}
        className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-800"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Torneos
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-8">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{tournament.name}</h1>
            <p className="text-gray-600">
              {new Date(tournament.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Información del Torneo</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-blue-500" />
                  <span>Course Rating: {tournament.course_rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-blue-500" />
                  <span>Slope Rating: {tournament.slope_rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>{tournament.players?.length || 0} jugadores inscritos</span>
                </div>
              </div>
            </div>

            {/* Sección de Resultados */}
            {tournament.results && tournament.results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Resultados</h2>
                  <select
                    value={scoringMode}
                    onChange={(e) => setScoringMode(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="medal">Medal (Stroke Play)</option>
                    <option value="stableford">Stableford</option>
                  </select>
                </div>
                {renderResultsTable()}
                {scoringMode === 'stableford' && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">
                      Sistema de Puntuación Stableford
                    </h3>
                    <ul className="text-sm text-blue-700">
                      <li>• Eagle o mejor: 4 puntos</li>
                      <li>• Birdie: 3 puntos</li>
                      <li>• Par: 2 puntos</li>
                      <li>• Bogey: 1 punto</li>
                      <li>• Double bogey o peor: 0 puntos</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario de Registro de Resultados */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Registrar Resultado</h2>
            <form onSubmit={handleSubmitScore} className="space-y-4">
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jugador
                  </label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar jugador</option>
                    {players.map((player) => (
                      <option key={player._id} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado (Gross Score)
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ingresa el resultado"
                  step="0.1"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Registrar Resultado
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
