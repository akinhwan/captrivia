// GameContext.tsx
import React, { createContext, useContext, useState } from "react";

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({});

  const updateGameState = (newState) => {
    setGameState((prevState) => ({ ...prevState, ...newState }));
  };

  const resetGameState = () => {
    setGameState({});
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
