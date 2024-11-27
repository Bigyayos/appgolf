import React, { useState, useEffect } from 'react';
import { api } from './api';

const PlayerDetails = ({ username }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const player = await api.getPlayerByUsername(username);
        setPlayer(player);
      } catch (error) {
        console.error('Error al obtener detalles del jugador:', error);
      }
    };
    fetchPlayer();
  }, [username]);

  if (!player) return <div>Cargando...</div>;

  return (
    <div>
      <h2>{player.name}</h2>
      <p>Hándicap: {player.handicap}</p>
      <p>Victorias: {player.victories}</p>
      <p>Ranking: {player.ranking}</p>
      <h3>Últimos Torneos</h3>
      {player.lastTournaments.map(tournament => (
        <div key={tournament.id}>
          <h4>{tournament.name}</h4>
          <p>Resultado: {tournament.result}</p>
        </div>
      ))}
      <h3>Temporadas Activas</h3>
      {player.activeSessions.map(session => (
        <div key={session.id}>
          <h4>{session.name}</h4>
          <p>Estado: {session.status}</p>
        </div>
      ))}
    </div>
  );
};

export default PlayerDetails;
