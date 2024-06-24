import React, { useState, useEffect } from "react";

interface QuestionPayload {
  id: string;
  options: [];
  question: string;
  seconds: number;
}

interface QuestionObject {
  id: string;
  payload: QuestionPayload;
  type: string;
}

interface GameScreenProps {
  question: QuestionObject;
  onAnswer: () => {};
}

const GameScreen: React.FC<GameScreenProps> = ({ question, onAnswer }) => {
  // const [question, setQuestion] = useState(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    setRemainingTime(question.payload.seconds);
    setSelectedOption(null);
    // setQuestion(question);
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
    onAnswer(question.id, index, question.payload.id);
  };

  return (
    <div className="game-screen text-center mt-10">
      <h2 className="text-2xl font-semibold">{question.payload.question}</h2>
      <div className="flex justify-center mt-6">
        <div className="options flex flex-col items-start mt-6">
          {question.payload.options &&
            question.payload.options.map((option: string, index: number) => (
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
            ))}
        </div>
      </div>
      <div className="timer mt-6 text-xl font-bold">
        Time remaining: {remainingTime}
      </div>
    </div>
  );
};

export default GameScreen;
