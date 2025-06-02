import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Pause, Play, PlusCircle, MinusCircle, ChevronRight, ArrowRight, RotateCw } from 'lucide-react';

const BoardGameTimer = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', time: 0, color: '#3B82F6' },
    { id: 2, name: 'Player 2', time: 0, color: '#EF4444' },
  ]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [direction, setDirection] = useState('clockwise'); // 'clockwise', 'anticlockwise', 'manual'
  const [totalGameTime, setTotalGameTime] = useState(0);

  // Add player
  const addPlayer = () => {
    if (players.length < 8) {
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
      setPlayers([...players, { 
        id: Date.now(), 
        name: `Player ${players.length + 1}`, 
        time: 0,
        color: colors[players.length % colors.length]
      }]);
    }
  };

  // Remove player
  const removePlayer = () => {
    if (players.length > 2) {
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
  const nextTurn = () => {
    if (direction === 'clockwise') {
      setActivePlayer((activePlayer + 1) % players.length);
    } else if (direction === 'anticlockwise') {
      setActivePlayer((activePlayer - 1 + players.length) % players.length);
    }
    // For 'manual', the player is selected directly by clicking
  };

  // Select player manually
  const selectPlayer = (index) => {
    if (direction === 'manual') {
      setActivePlayer(index);
    }
  };

  // Reset all timers
  const resetTimers = () => {
    setIsRunning(false);
    setActivePlayer(0);
    setTotalGameTime(0);
    setPlayers(players.map(player => ({ ...player, time: 0 })));
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
        setPlayers(prevPlayers => {
          const newPlayers = [...prevPlayers];
          newPlayers[activePlayer].time += 1;
          return newPlayers;
        });
        setTotalGameTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activePlayer]);

  // Calculate average turn time
  const getAverageTurnTime = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return '00:00';
    return formatTime(Math.floor(player.time));
  };

  // Calculate player position in circle
  const getPlayerPosition = (index, totalPlayers) => {
    const angleStep = (2 * Math.PI) / totalPlayers;
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const radius = 150; // Circle radius
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
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
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 rounded-lg px-3 py-1"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button 
              onClick={toggleTimer}
              className={`flex items-center gap-1 ${isRunning ? 'bg-yellow-200 hover:bg-yellow-300' : 'bg-green-200 hover:bg-green-300'} rounded-lg px-3 py-1`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />} {isRunning ? 'Pause' : 'Start'}
            </button>
          </div>
          
          <div className="flex justify-center gap-6 mb-6">
            <button onClick={addPlayer} disabled={players.length >= 8} className="flex items-center gap-1 text-sm">
              <PlusCircle size={16} /> Add Player
            </button>
            <button onClick={removePlayer} disabled={players.length <= 2} className="flex items-center gap-1 text-sm">
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
        <div className="relative h-80 flex items-center justify-center mb-4">
          {players.map((player, index) => {
            const { x, y } = getPlayerPosition(index, players.length);
            const isActive = index === activePlayer;
            
            return (
              <div 
                key={player.id}
                onClick={() => selectPlayer(index)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  isActive ? 'scale-110 z-10' : ''
                } transition-all duration-300 cursor-pointer`}
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
                    className="bg-transparent text-center w-20 font-medium mb-1 text-sm"
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center justify-center gap-1">
                    <Clock size={14} />
                    <span className="text-sm font-mono">
                      {formatTime(player.time)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Next Turn Button (in the middle) */}
          {direction !== 'manual' && (
            <button
              onClick={nextTurn}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-20"
            >
              {direction === 'clockwise' ? <RotateCw size={24} /> : <RotateCcw size={24} />}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Player Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {players.map((player) => (
              <div key={player.id} className="bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Turn Time: {getAverageTurnTime(player.id)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() { return <BoardGameTimer />; }
