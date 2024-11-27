from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import requests
from functools import wraps

# Configuración de Flask y MongoDB
app = Flask(__name__)
CORS(app)  # Esto permite las peticiones desde el frontend
client = MongoClient('mongodb://localhost:27017/')
db = client['golf_app']

# Decorator para validación de JSON
def validate_json(*expected_args):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({"error": "Content-Type debe ser application/json"}), 400
            
            data = request.get_json()
            for arg in expected_args:
                if arg not in data:
                    return jsonify({"error": f"Falta el campo requerido: {arg}"}), 400
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Modelos de datos
class Season:
    def __init__(self, name, start_date, end_date, description=None):
        self.name = name
        self.start_date = start_date
        self.end_date = end_date
        self.description = description
        self.tournaments = []
        self.rankings = []
        self.status = "active"

    def to_dict(self):
        return {
            "name": self.name,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "description": self.description,
            "tournaments": self.tournaments,
            "rankings": self.rankings,
            "status": self.status
        }

class Player:
    def __init__(self, name, initial_handicap):
        self.name = name
        self.handicap = float(initial_handicap)
        self.scores = []
        self.victories = 0
        self.ranking_points = 0

    def to_dict(self):
        return {
            "name": self.name,
            "handicap": self.handicap,
            "scores": self.scores,
            "victories": self.victories,
            "ranking_points": self.ranking_points
        }

class Score:
    def __init__(self, player_id, gross_score, course_rating, slope_rating, date):
        self.player_id = player_id
        self.gross_score = float(gross_score)
        self.course_rating = float(course_rating)
        self.slope_rating = float(slope_rating)
        self.date = date
        self.differential = self.calculate_differential()

    def calculate_differential(self):
        return ((self.gross_score - self.course_rating) * 113) / self.slope_rating

    def to_dict(self):
        return {
            "player_id": self.player_id,
            "gross_score": self.gross_score,
            "course_rating": self.course_rating,
            "slope_rating": self.slope_rating,
            "date": self.date,
            "differential": self.differential
        }

class Tournament:
    def __init__(self, name, date, course_rating, slope_rating, category):
        self.name = name
        self.date = date
        self.course_rating = float(course_rating)
        self.slope_rating = float(slope_rating)
        self.category = category
        self.players = []
        self.results = []

    def to_dict(self):
        return {
            "name": self.name,
            "date": self.date,
            "course_rating": self.course_rating,
            "slope_rating": self.slope_rating,
            "category": self.category,
            "players": self.players,
            "results": self.results
        }

# Funciones auxiliares
def calculate_tournament_points(position, tournament_category):
    """
    Calcula los puntos de ranking basados en la posición y categoría del torneo
    """
    base_points = {
        'A': {1: 100, 2: 80, 3: 65, 4: 55, 5: 45, 6: 35, 7: 25, 8: 15, 9: 10, 10: 5},
        'B': {1: 75, 2: 60, 3: 48, 4: 41, 5: 34, 6: 26, 7: 19, 8: 11, 9: 8, 10: 4},
        'C': {1: 50, 2: 40, 3: 32, 4: 27, 5: 22, 6: 17, 7: 12, 8: 7, 9: 5, 10: 2}
    }
    
    if position > 10:
        return 0
    
    return base_points[tournament_category][position]

def update_player_ranking(player_id, tournament_points):
    """
    Actualiza los puntos de ranking de un jugador
    """
    player = db.players.find_one({"_id": ObjectId(player_id)})
    if not player:
        return False
    
    current_points = player.get('ranking_points', 0)
    new_points = current_points + tournament_points
    
    db.players.update_one(
        {"_id": ObjectId(player_id)},
        {"$set": {"ranking_points": new_points}}
    )
    return True

def update_handicap(player_id):
    scores = list(db.scores.find({"player_id": ObjectId(player_id)}).sort("date", -1).limit(20))
    
    if len(scores) < 8:
        return
    
    scores.sort(key=lambda x: x['differential'])
    best_8 = scores[:8]
    
    new_handicap = sum(score['differential'] for score in best_8) / 8 * 0.96
    
    db.players.update_one(
        {"_id": ObjectId(player_id)},
        {"$set": {"handicap": round(new_handicap, 1)}}
    )

# Rutas de la API
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Bienvenido a la API de Golf!",
        "endpoints_disponibles": {
            "GET /": "Página principal",
            "GET /players": "Lista todos los jugadores",
            "POST /players": "Crea un nuevo jugador",
            "GET /players/<id>": "Obtiene detalles de un jugador específico",
            "POST /scores": "Registra un nuevo score",
            "GET /rankings": "Muestra el ranking de jugadores",
            "POST /tournaments": "Crea un nuevo torneo",
            "POST /tournaments/<id>/results": "Registra resultados de un torneo",
            "GET /seasons": "Lista todas las temporadas",
            "POST /seasons": "Crea una nueva temporada",
            "GET /seasons/<id>": "Obtiene detalles de una temporada",
            "PUT /seasons/<id>": "Actualiza una temporada"
        }
    })

@app.route('/players', methods=['GET', 'POST'])
def players():
    if request.method == 'GET':
        try:
            players = list(db.players.find())
            return jsonify([{
                "id": str(player["_id"]),
                "name": player["name"],
                "handicap": player["handicap"],
                "victories": player.get("victories", 0),
                "ranking_points": player.get("ranking_points", 0)
            } for player in players])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser application/json"}), 400
        
        try:
            data = request.json
            if 'name' not in data or 'initial_handicap' not in data:
                return jsonify({"error": "Se requieren los campos 'name' y 'initial_handicap'"}), 400
            
            player = Player(data['name'], data['initial_handicap'])
            result = db.players.insert_one(player.to_dict())
            return jsonify({
                "message": "Jugador creado exitosamente",
                "id": str(result.inserted_id)
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

@app.route('/players/<player_id>', methods=['GET'])
def get_player(player_id):
    try:
        player = db.players.find_one({"_id": ObjectId(player_id)})
        if player:
            player['_id'] = str(player['_id'])
            return jsonify(player)
        return jsonify({"error": "Jugador no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/scores', methods=['POST'])
@validate_json('player_id', 'gross_score', 'course_rating', 'slope_rating')
def register_score():
    try:
        data = request.json
        player = db.players.find_one({"_id": ObjectId(data['player_id'])})
        if not player:
            return jsonify({"error": "Jugador no encontrado"}), 404

        score = Score(
            ObjectId(data['player_id']),
            data['gross_score'],
            data['course_rating'],
            data['slope_rating'],
            datetime.now()
        )
        
        db.scores.insert_one(score.to_dict())
        update_handicap(data['player_id'])
        
        return jsonify({"message": "Score registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/rankings', methods=['GET'])
def get_rankings():
    try:
        players = list(db.players.find().sort("ranking_points", -1))
        return jsonify([{
            "id": str(player["_id"]),
            "name": player["name"],
            "handicap": player["handicap"],
            "victories": player["victories"],
            "ranking_points": player["ranking_points"]
        } for player in players])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tournaments', methods=['GET', 'POST'])
def tournaments():
    if request.method == 'GET':
        try:
            tournaments = list(db.tournaments.find())
            return jsonify([{
                "id": str(tournament["_id"]),
                **{k: v for k, v in tournament.items() if k != '_id'}
            } for tournament in tournaments])
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser application/json"}), 400
        
        try:
            data = request.json
            if not all(field in data for field in ['name', 'date', 'course_rating', 'slope_rating', 'category']):
                return jsonify({"error": "Faltan campos requeridos"}), 400
            
            tournament = Tournament(
                data['name'],
                data['date'],
                data['course_rating'],
                data['slope_rating'],
                data['category']
            )
            
            result = db.tournaments.insert_one(tournament.to_dict())
            return jsonify({
                "message": "Torneo creado exitosamente",
                "id": str(result.inserted_id)
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

@app.route('/tournaments/<tournament_id>/results', methods=['POST'])
@validate_json('results')
def register_tournament_results(tournament_id):
    try:
        data = request.json
        tournament = db.tournaments.find_one({"_id": ObjectId(tournament_id)})
        if not tournament:
            return jsonify({"error": "Torneo no encontrado"}), 404
        
        for result in data['results']:
            player_id = result['player_id']
            position = result['position']
            points = calculate_tournament_points(position, tournament['category'])
            update_player_ranking(player_id, points)
            
            if position == 1:
                db.players.update_one(
                    {"_id": ObjectId(player_id)},
                    {"$inc": {"victories": 1}}
                )
        
        db.tournaments.update_one(
            {"_id": ObjectId(tournament_id)},
            {"$set": {"results": data['results']}}
        )
        
        return jsonify({"message": "Resultados registrados exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/seasons', methods=['GET', 'POST'])
def seasons():
    if request.method == 'GET':
        try:
            seasons = list(db.seasons.find())
            return jsonify([{
                "id": str(season["_id"]),
                **{k: v for k, v in season.items() if k != '_id'}
            } for season in seasons])
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser application/json"}), 400
        
        try:
            data = request.json
            required_fields = ['name', 'start_date', 'end_date']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Faltan campos requeridos"}), 400
            
            season = Season(
                data['name'],
                data['start_date'],
                data['end_date'],
                data.get('description')
            )
            
            result = db.seasons.insert_one(season.to_dict())
            return jsonify({
                "message": "Temporada creada exitosamente",
                "id": str(result.inserted_id)
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

@app.route('/seasons/<season_id>', methods=['GET', 'PUT'])
def manage_season(season_id):
    if request.method == 'GET':
        try:
            season = db.seasons.find_one({"_id": ObjectId(season_id)})
            if not season:
                return jsonify({"error": "Temporada no encontrada"}), 404
            
            season['_id'] = str(season['_id'])
            return jsonify(season)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    elif request.method == 'PUT':
        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser application/json"}), 400
        
        try:
            data = request.json
            update_data = {}
            
            allowed_fields = ['name', 'description', 'status']
            for field in allowed_fields:
                if field in data:
                    update_data[field] = data[field]
            
            if not update_data:
                return jsonify({"error": "No hay campos válidos para actualizar"}), 400
            
            result = db.seasons.update_one(
                {"_id": ObjectId(season_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                return jsonify({"error": "Temporada no encontrada"}), 404
                
            return jsonify({"message": "Temporada actualizada exitosamente"})
        except Exception as e:
            return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
