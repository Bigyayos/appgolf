import React, { useState, useEffect } from 'react';

const TournamentEditForm = ({ tournament, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    course_rating: '',
    slope_rating: '',
    category: 'A'
  });

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        date: tournament.date,
        course_rating: tournament.course_rating,
        slope_rating: tournament.slope_rating,
        category: tournament.category
      });
    }
  }, [tournament]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Editar Torneo</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre del Torneo
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
              Fecha
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Course Rating
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full p-2 border rounded"
              value={formData.course_rating}
              onChange={(e) => setFormData({ ...formData, course_rating: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Slope Rating
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.slope_rating}
              onChange={(e) => setFormData({ ...formData, slope_rating: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Categoría
            </label>
            <select
              className="w-full p-2 border rounded"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
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

export default TournamentEditForm;
