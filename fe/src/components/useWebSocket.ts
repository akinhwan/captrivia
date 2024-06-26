// useWebSocket.ts
import { useState, useEffect, useCallback } from "react";
import { Api } from "../api"; // Adjust the import path as necessary
import { toast } from "react-toastify";
import { useGame } from "./GameContext";

const useWebSocket = (
  api: Api,
  playerName: string,
  fetchGames: () => void,
  fetchLeaderboard: () => void,
  navigate: any
) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { updateGameState, resetGameState, gameState } = useGame();
  const [playerReadyEvent, setPlayerReadyEvent] = useState(null);

  useEffect(() => {
    if (playerReadyEvent) {
      const player = playerReadyEvent.payload.player;
      console.log("Current State:", gameState);
      console.log("Player:", player);

      // Existing game_player_ready logic here
      updateGameState((prevState) => {
        const readyPlayers = prevState.readyPlayers;
        console.log(prevState);
        if (!readyPlayers.includes(player)) {
          const newReadyPlayers = [...readyPlayers, player];
          return { ...prevState, readyPlayers: newReadyPlayers };
        }
        return prevState;
      });
    }
  }, [playerReadyEvent]);

  const handleConnect = useCallback(() => {
    api.connectToServer(playerName, (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.error) {
        toast.error(`${data.error}`);
      } else {
        switch (data.type) {
          case "game_player_enter":
            navigate("/game");
            updateGameState({
              data: data,
              playerName: playerName,
              readyPlayers: [],
            });
            if (data.payload.players.length === 1) {
              updateGameState({ game_creator: true });
            } else {
              updateGameState({ game_creator: false });
            }
            break;
          case "game_player_ready":
            setPlayerReadyEvent(data);
            break;
          case "game_question":
            updateGameState({ question: data });
            break;
          case "game_player_correct":
            if (data.payload.player === playerName) {
              toast.success("Correct Answer!");
            }
            break;
          case "game_player_incorrect":
            if (data.payload.player === playerName) {
              toast.error("Incorrect Answer.");
            }
            break;
          case "game_create":
            fetchGames();
            break;
          case "game_destroy":
            fetchGames();
            break;
          case "game_end":
            fetchLeaderboard();
            fetchGames();
            navigate("/leaderboard");
            resetGameState();
            break;
          case "game_join":
            break;
          case "game_start":
            break;
          case "game_player_join":
            break;
          case "game_player_leave":
            break;
          case "game_player_countdown":
            break;
        }
      }
    });
    setIsConnected(true);
  }, [
    api,
    playerName,
    fetchGames,
    fetchLeaderboard,
    navigate,
    setPlayerReadyEvent,
  ]);

  const disconnect = useCallback(() => {
    api.disconnect();
    setIsConnected(false);
  }, [api]);

  return { isConnected, handleConnect, disconnect };
};

export default useWebSocket;
