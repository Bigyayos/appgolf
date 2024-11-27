import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const PlayersTable = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const players = await api.getPlayers();
        setPlayers(players);
      } catch (error) {
        console.error('Error al obtener jugadores:', error);
      }
    };
    fetchPlayers();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Hándicap</th>
          <th>Victorias</th>
          <th>Ranking</th>
        </tr>
      </thead>
      <tbody>
        {players.map(player => (
          <tr key={player.id}>
            <td>{player.name}</td>
            <td>{player.handicap}</td>
            <td>{player.victories}</td>
            <td>{player.ranking}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlayersTable;
