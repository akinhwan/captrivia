// useWebSocket.ts
import { useState, useCallback } from "react";
import { Api } from "../api"; // Adjust the import path as necessary
import { toast } from "react-toastify";

const useWebSocket = (
  api: Api,
  playerName: string,
  fetchGames: () => void,
  fetchLeaderboard: () => void,
  navigate: any
) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const handleConnect = useCallback(() => {
    api.connectToServer(playerName, (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.error) {
        toast.error(`${data.error}`);
      } else {
        // Handle different types of messages
        switch (data.type) {
          case "game_create":
            fetchGames();
          case "game_destroy":
            fetchGames();
            break;
          case "game_end":
            fetchLeaderboard();
            fetchGames();
            navigate("/leaderboard");
            break;
          case "game_question":
            navigate("/game", {
              state: { question: data, playerName: playerName },
            });
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
          case "game_player_enter":
            navigate("/game", {
              state: { data: data, playerName: playerName },
            });
          case "game_join":
          //
          case "game_start":
            console.log("Game started:", data.id);
          case "game_player_join":
          //
          case "game_player_ready":
          //
          case "game_player_leave":
          //
          case "game_player_countdown":
          //
        }
      }
    });
    setIsConnected(true);
  }, [api, playerName, fetchGames, fetchLeaderboard, navigate]);

  const disconnect = useCallback(() => {
    api.disconnect();
    setIsConnected(false);
  }, [api]);

  return { isConnected, handleConnect, disconnect };
};

export default useWebSocket;
