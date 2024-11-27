import React, { useState, useEffect } from 'react';

const PlayerEditForm = ({ player, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    handicap: '',
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        handicap: player.handicap,
      });
    }
  }, [player]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Editar Jugador</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Hándicap
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full p-2 border rounded"
              value={formData.handicap}
              onChange={(e) => setFormData({ ...formData, handicap: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerEditForm;
