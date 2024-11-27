import React, { useState, useEffect } from 'react';
import { api } from './api';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const rankings = await api.getRankings();
        setRankings(rankings);
      } catch (error) {
        console.error('Error al obtener rankings:', error);
      }
    };
    fetchRankings();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Posición</th>
          <th>Nombre</th>
          <th>Ranking</th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((player, index) => (
          <tr key={player.id}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.ranking}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Rankings;
