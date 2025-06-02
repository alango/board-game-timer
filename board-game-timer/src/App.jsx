import React, { useState, useEffect, useCallback } from 'react';
import { Clock, RotateCcw, Pause, Play, PlusCircle, MinusCircle, RotateCw } from 'lucide-react';

// Constants
const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const CIRCLE_RADIUS = 130;

const BoardGameTimer = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', time: 0, turnCount: 0, color: '#3B82F6' },
    { id: 2, name: 'Player 2', time: 0, turnCount: 0, color: '#EF4444' },
  ]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTurnTime, setCurrentTurnTime] = useState(0);
  const [direction, setDirection] = useState('clockwise'); // 'clockwise', 'anticlockwise', 'manual'
  const [totalGameTime, setTotalGameTime] = useState(0);

  // Helper function to update player stats
  const updatePlayerStats = useCallback((activePlayerIndex, currentTime) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[activePlayerIndex] = {
        ...newPlayers[activePlayerIndex],
        turnCount: newPlayers[activePlayerIndex].turnCount + 1,
        time: newPlayers[activePlayerIndex].time + currentTime
      };
      return newPlayers;
    });
  }, []);

  // Add player
  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { 
        id: Date.now(), 
        name: `Player ${players.length + 1}`, 
        time: 0,
        turnCount: 0,
        color: PLAYER_COLORS[players.length % PLAYER_COLORS.length]
      }]);
    }
  };

  // Remove player
  const removePlayer = () => {
    if (players.length > MIN_PLAYERS) {
      const newPlayers = [...players];
      newPlayers.pop();
      setPlayers(newPlayers);
      if (activePlayer >= newPlayers.length) {
        setActivePlayer(0);
      }
    }
  };

  // Update player name
  const updatePlayerName = (id, newName) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name: newName } : player
    ));
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Next turn
  const nextTurn = useCallback(() => {
    if (direction === 'manual') return; // Prevent nextTurn in manual mode
    
    // Update turn count and total time for current player
    updatePlayerStats(activePlayer, currentTurnTime);
    
    // Reset current turn time
    setCurrentTurnTime(0);
    
    // Use functional updates for activePlayer to avoid stale closure
    setActivePlayer(prevActivePlayer => {
      if (direction === 'clockwise') {
        return (prevActivePlayer + 1) % players.length;
      } else if (direction === 'anticlockwise') {
        return (prevActivePlayer - 1 + players.length) % players.length;
      }
      return prevActivePlayer;
    });
  }, [direction, activePlayer, currentTurnTime, players.length, updatePlayerStats]);

  // Select player manually
  const selectPlayer = useCallback((index) => {
    if (direction === 'manual') {
      // Update turn count and total time for current player if switching
      if (index !== activePlayer) {
        updatePlayerStats(activePlayer, currentTurnTime);
        setCurrentTurnTime(0);
      }
      setActivePlayer(index);
    }
  }, [direction, activePlayer, currentTurnTime, updatePlayerStats]);

  // Reset all timers
  const resetTimers = () => {
    setIsRunning(false);
    setActivePlayer(0);
    setTotalGameTime(0);
    setCurrentTurnTime(0);
    setPlayers(players.map(player => ({ ...player, time: 0, turnCount: 0 })));
  };

  // Toggle pause/play
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTurnTime(prev => prev + 1);
        setTotalGameTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);


  // Calculate player position in circle
  const getPlayerPosition = (index, totalPlayers) => {
    const angleStep = (2 * Math.PI) / totalPlayers;
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const x = CIRCLE_RADIUS * Math.cos(angle);
    const y = CIRCLE_RADIUS * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Board Game Turn Timer</h1>
          <div className="flex justify-center gap-4 mb-4">
            <button 
              onClick={resetTimers}
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 hover:cursor-pointer rounded-lg px-3 py-1"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button 
              onClick={toggleTimer}
              className={`flex items-center gap-1 ${isRunning ? 'bg-yellow-200 hover:bg-yellow-300' : 'bg-green-200 hover:bg-green-300'} hover:cursor-pointer rounded-lg px-3 py-1`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />} {isRunning ? 'Pause' : 'Start'}
            </button>
          </div>
          
          <div className="flex justify-center gap-6 mb-6">
            <button onClick={addPlayer} disabled={players.length >= MAX_PLAYERS} className="flex items-center gap-1 text-sm hover:cursor-pointer hover:text-blue-600 disabled:hover:cursor-not-allowed disabled:hover:text-gray-400">
              <PlusCircle size={16} /> Add Player
            </button>
            <button onClick={removePlayer} disabled={players.length <= MIN_PLAYERS} className="flex items-center gap-1 text-sm hover:cursor-pointer hover:text-red-600 disabled:hover:cursor-not-allowed disabled:hover:text-gray-400">
              <MinusCircle size={16} /> Remove Player
            </button>
          </div>
          
          <div className="flex justify-center gap-4 mb-2">
            <label className="flex items-center gap-1">
              <input 
                type="radio" 
                checked={direction === 'clockwise'} 
                onChange={() => setDirection('clockwise')} 
              />
              <RotateCw size={16} /> Clockwise
            </label>
            <label className="flex items-center gap-1">
              <input 
                type="radio" 
                checked={direction === 'anticlockwise'} 
                onChange={() => setDirection('anticlockwise')} 
              />
              <RotateCcw size={16} /> Anti-clockwise
            </label>
            <label className="flex items-center gap-1">
              <input 
                type="radio" 
                checked={direction === 'manual'} 
                onChange={() => setDirection('manual')} 
              />
              Manual
            </label>
          </div>
          
          <div className="text-sm text-gray-500">
            Total Game Time: {formatTime(totalGameTime)}
          </div>
        </div>

        {/* Players Circle */}
        <div className="relative h-96 flex items-center justify-center mb-4">
          {players.map((player, index) => {
            const { x, y } = getPlayerPosition(index, players.length);
            const isActive = index === activePlayer;
            
            return (
              <div 
                key={player.id}
                onClick={() => direction === 'manual' ? selectPlayer(index) : null}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  isActive ? 'scale-110 z-10' : ''
                } transition-all duration-300 ${direction === 'manual' ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ 
                  left: `calc(50% + ${x}px)`, 
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <div 
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-md ${
                    isActive ? 'ring-4 ring-blue-400' : ''
                  }`}
                  style={{ backgroundColor: player.color + '33' }} // Adding transparency
                >
                  <input
                    className="bg-transparent text-center w-20 font-medium mb-1 text-xs"
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isActive ? (
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {formatTime(currentTurnTime)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Total: {formatTime(player.time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Turns: {player.turnCount}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock size={12} />
                        <span className="text-xs font-mono">
                          {formatTime(player.time)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Turns: {player.turnCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Next Turn Button (in the middle) */}
          {direction !== 'manual' && (
            <button
              onClick={nextTurn}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg z-20"
            >
              {direction === 'clockwise' ? <RotateCw size={20} /> : <RotateCcw size={20} />}
              <span className="text-xs mt-1">Next</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default function App() { return <BoardGameTimer />; }
