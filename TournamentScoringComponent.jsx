import React, { useState, useEffect } from 'react';
import { Trophy, Award, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const calculateStablefordPoints = (grossScore, par, handicap) => {
  const netScore = grossScore - handicap;
  const difference = netScore - par;
  
  // Stableford scoring system
  if (difference <= -2) return 4;       // Eagle o mejor
  if (difference === -1) return 3;      // Birdie
  if (difference === 0) return 2;       // Par
  if (difference === 1) return 1;       // Bogey
  return 0;                             // Double bogey o peor
};

const calculateMedalPoints = (grossScore, handicap) => {
  return grossScore - handicap; // Net score
};

const TournamentScoring = ({ tournament, players }) => {
  const [scores, setScores] = useState([]);
  const [gameMode, setGameMode] = useState('medal'); // 'medal' o 'stableford'
  const [rankings, setRankings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scores.length > 0) {
      calculateRankings();
    }
  }, [scores, gameMode]);

  const calculateRankings = () => {
    const calculatedRankings = scores.map(score => {
      const player = players.find(p => p.name === score.player_name);
      const handicap = player ? player.handicap : 0;
      
      let points;
      if (gameMode === 'stableford') {
        points = calculateStablefordPoints(score.gross_score, tournament.par || 72, handicap);
      } else {
        points = calculateMedalPoints(score.gross_score, handicap);
      }
      
      return {
        player_name: score.player_name,
        gross_score: score.gross_score,
        handicap: handicap,
        points: points
      };
    });

    // Ordenar rankings según el modo de juego
    calculatedRankings.sort((a, b) => {
      if (gameMode === 'stableford') {
        return b.points - a.points; // Mayor puntuación es mejor en Stableford
      } else {
        return a.points - b.points; // Menor puntuación es mejor en Medal
      }
    });

    setRankings(calculatedRankings);
  };

  const handleScoreSubmit = (playerName, grossScore) => {
    setScores(prev => [...prev, { player_name: playerName, gross_score: grossScore }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Resultados y Rankings
        </h2>
        <Select value={gameMode} onValueChange={setGameMode}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Modo de juego" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medal">Medal (Stroke Play)</SelectItem>
            <SelectItem value="stableford">Stableford</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          Ranking Actual
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posición</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead>Score Bruto</TableHead>
              <TableHead>Handicap</TableHead>
              <TableHead>Puntos {gameMode === 'stableford' ? 'Stableford' : 'Neto'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((ranking, index) => (
              <TableRow key={ranking.player_name}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{ranking.player_name}</TableCell>
                <TableCell>{ranking.gross_score}</TableCell>
                <TableCell>{ranking.handicap}</TableCell>
                <TableCell className="font-bold">
                  {ranking.points}
                  {gameMode === 'stableford' ? ' pts' : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Información del Sistema de Puntuación</h4>
        {gameMode === 'stableford' ? (
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Eagle o mejor: 4 puntos</li>
            <li>• Birdie: 3 puntos</li>
            <li>• Par: 2 puntos</li>
            <li>• Bogey: 1 punto</li>
            <li>• Double bogey o peor: 0 puntos</li>
          </ul>
        ) : (
          <p className="text-sm text-blue-700">
            Medal (Stroke Play): Se resta el handicap del score bruto para obtener el score neto.
            El jugador con el score neto más bajo gana.
          </p>
        )}
      </div>
    </div>
  );
};

export default TournamentScoring;
