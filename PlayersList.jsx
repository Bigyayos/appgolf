import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Link } from 'react-router-dom';

const PlayersList = () => {
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
            <td><Link to={`/players/${player.name}`}>{player.name}</Link></td>
            <td>{player.handicap}</td>
            <td>{player.victories}</td>
            <td>{player.ranking}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlayersList;
