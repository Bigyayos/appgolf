

const API_BASE_URL = 'http://localhost:5000';

export const api = {
  async getPlayers() {
    try {
      const response = await fetch(`${API_BASE_URL}/players`);
      if (!response.ok) throw new Error('Error al obtener jugadores');
      return await response.json();
    } catch (error) {
      console.error('Error en getPlayers:', error);
      throw error;
    }
  },

  async getPlayerByUsername(username) {
    try {
      const players = await this.getPlayers();
      return players.find(p => p.name === username);
    } catch (error) {
      console.error('Error en getPlayerByUsername:', error);
      throw error;
    }
  },

  async getRankings() {
    try {
      const response = await fetch(`${API_BASE_URL}/rankings`);
      if (!response.ok) throw new Error('Error al obtener rankings');
      return await response.json();
    } catch (error) {
      console.error('Error en getRankings:', error);
      throw error;
    }
  },

  async deletePlayer(playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar jugador');
      return await response.json();
    } catch (error) {
      console.error('Error en deletePlayer:', error);
      throw error;
    }
  }
};
