// GameContext.tsx
import { createContext, useContext, useState } from "react";

const GameContext = createContext(null);

const initialState = {
  data: null,
  question: null,
  readyPlayers: [],
  game_creator: false,
  playerName: "",
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({});

  const updateGameState = (newState) => {
    setGameState((prevState) => ({ ...prevState, ...newState }));
  };

  const resetGameState = () => {
    setGameState(initialState);
  };

  return (
    <GameContext.Provider
      value={{ gameState, updateGameState, resetGameState }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
