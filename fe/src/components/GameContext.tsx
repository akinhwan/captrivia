import React, { createContext, useContext, useState, ReactNode } from "react";

interface GameState {
  data: object | null;
  question: object | null;
  readyPlayers: string[];
  game_creator: boolean;
  playerName: string;
}

interface GameContextType {
  gameState: GameState;
  updateGameState: (newState: Partial<GameState>) => void;
  resetGameState: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
  data: null,
  question: null,
  readyPlayers: [],
  game_creator: false,
  playerName: "",
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateGameState = (newState: Partial<GameState>) => {
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

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
