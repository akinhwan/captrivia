import React, { useState, useEffect } from "react";
import { useGame } from "../hooks/GameContext";
import { useNavigate } from "react-router-dom";

type GameProps = {
  handleAnswerGame: (
    questionId: string,
    optionIndex: number,
    payloadId: string
  ) => void;
  handleReadyGame: (gameId: string) => void;
  handleStartGame: (gameId: string) => void;
};

type GameState = {
  question: {
    id: string;
    payload: {
      seconds: number;
      id: string;
      question: string;
      options: string[];
    };
  };
  data: {
    id: string;
    payload: {
      name: string;
      players: string[];
      question_count: number;
    };
  };
  playerName: string;
  readyPlayers: string[];
  game_creator?: boolean;
};

const Game: React.FC<GameProps> = ({
  handleAnswerGame,
  handleReadyGame,
  handleStartGame,
}) => {
  const { gameState } = useGame() as { gameState: GameState };
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    console.log(`Game State: ${gameState}`);
    if (gameState.data === null) {
      navigate("/");
    }
    if (gameState.question) {
      setRemainingTime(gameState.question.payload.seconds);
      setSelectedOption(null);
    }
    if (gameState.readyPlayers) {
      setIsReady(gameState.readyPlayers.includes(gameState.playerName));
    }
  }, [gameState]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime]);

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    if (handleAnswerGame) {
      handleAnswerGame(
        gameState.question.id,
        index,
        gameState.question.payload.id
      );
    }
  };

  return (
    <>
      <p className="fixed top-4 right-4">
        Player Name: <b>{gameState.playerName}</b>
      </p>
      {!gameState.question ? (
        <>
          {gameState.data && (
            <>
              <h1 className="text-4xl font-bold mb-4">
                {gameState.data.payload.name}
              </h1>
              {/* <p>Game ID: {gameState.data.id}</p> */}
              <p>Question Count: {gameState.data.payload.question_count}</p>
              <ul className="list-disc">
                Players:
                {gameState.data.payload.players.map((player) => (
                  <li
                    className={`ml-8 ${
                      gameState.readyPlayers.includes(player)
                        ? "text-green-500"
                        : ""
                    }`}
                    key={player}
                  >
                    {player}
                  </li>
                ))}
              </ul>
            </>
          )}
          <button
            onClick={() => handleReadyGame(gameState.data.id)}
            className={`bg-yellow-500 text-white px-4 py-2 rounded mt-2 ${
              isReady ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isReady}
          >
            Ready
          </button>
          {isReady && gameState.game_creator && (
            <button
              onClick={() => handleStartGame(gameState.data.id)}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-2"
            >
              Start Game
            </button>
          )}
        </>
      ) : (
        <div className="game-screen text-center mt-10">
          <h2 className="text-2xl font-semibold">
            {gameState.question.payload.question}
          </h2>
          <div className="flex justify-center mt-6">
            <div className="options flex flex-col items-start mt-6">
              {gameState.question.payload.options &&
                gameState.question.payload.options.map(
                  (option: string, index: number) => (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(index)}
                      className={`option-button ${
                        selectedOption === index
                          ? "bg-blue-500 text-white"
                          : "bg-transparent hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500"
                      } px-4 py-2 rounded mt-2`}
                    >
                      {option}
                    </button>
                  )
                )}
            </div>
          </div>
          <div className="timer mt-6 text-xl font-bold">
            Time remaining: {remainingTime}
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
