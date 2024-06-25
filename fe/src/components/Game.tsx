import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Game: React.FC = ({
  handleAnswerGame,
  handleReadyGame,
  handleStartGame,
}) => {
  const location = useLocation();
  const { data, playerName, question } = location.state || {
    data: null,
    playerName: null,
    question: null,
  };
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (question) {
      setRemainingTime(question.payload.seconds);
      setSelectedOption(null);
    }
  }, [question]);

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
      handleAnswerGame(question.id, index, question.payload.id);
    }
  };

  // const handleReadyClick = () => {
  //   handleReadyGame(data.id);
  //   setIsRdyBtnDisabled(true);
  // };

  return (
    <>
      <p className="fixed top-4 right-4">
        Player Name: <b>{playerName}</b>
      </p>
      {!question ? (
        <>
          {data && (
            <>
              <p>Game ID: {data.id}</p>
              <p>Game Name: {data.payload.name}</p>
              <p>{JSON.stringify(data.payload.players)}</p>
              <p>
                {data.payload.players_ready &&
                  JSON.stringify(data.payload.players_ready)}
              </p>
              <p>Question Count: {data.payload.question_count}</p>
            </>
          )}
          <button
            onClick={() => handleReadyGame(data.id)}
            className={`bg-yellow-500 text-white px-4 py-2 rounded mt-2 ${
              isReady ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isReady}
          >
            Ready
          </button>
          {isReady && (
            <button
              onClick={() => handleStartGame(data.id)}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-2"
            >
              Start Game
            </button>
          )}
          {/* <div className="game-screen text-center mt-10">
          No question available
        </div> */}
        </>
      ) : (
        <div className="game-screen text-center mt-10">
          <h2 className="text-2xl font-semibold">
            {question.payload.question}
          </h2>
          <div className="flex justify-center mt-6">
            <div className="options flex flex-col items-start mt-6">
              {question.payload.options &&
                question.payload.options.map(
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
