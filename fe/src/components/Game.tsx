import React, { useState, useEffect } from "react";
import { useGame } from "./GameContext";
import { useNavigate } from "react-router-dom";

const Game: React.FC = ({
  handleAnswerGame,
  handleReadyGame,
  handleStartGame,
}) => {
  const { gameState } = useGame();
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    console.log(gameState);
    if (gameState.question) {
      setRemainingTime(gameState.question.payload.seconds);
      setSelectedOption(null);
    }
    if (Object.keys(gameState).length === 0) {
      navigate("/");
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
              <p>Game ID: {gameState.data.id}</p>
              <p>Game Name: {gameState.data.payload.name}</p>
              <p>Players: {gameState.data.payload.players.join(", ")}</p>
              <p>Question Count: {gameState.data.payload.question_count}</p>
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
