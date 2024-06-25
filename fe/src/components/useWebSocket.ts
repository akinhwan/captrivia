// useWebSocket.ts
import { useState, useEffect } from "react";
import { Api } from "./api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useWebSocket = (api: Api, playerName: string) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnect = () => {
      api.connectToServer(playerName, (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.error) {
          toast.error(`${data.error}`);
        } else if (data.type === "game_player_enter") {
          // send creator straight into the game
          navigate("/game", { state: { data: data, playerName: playerName } });
          // when a new player enters (not creator)
          // send latest data.payload.players_ready array to Game to display status
        } else if (data.type === "game_join") {
          setJoinedGames((prevJoinedGames) =>
            new Set(prevJoinedGames).add(data.id)
          );
        } else if (data.type === "game_create") {
          fetchGames();
        } else if (data.type === "game_destroy") {
          fetchGames();
        } else if (data.type === "game_start") {
          console.log("Game started:", data.id);
        } else if (data.type === "game_player_join") {
          // Handle player join
        } else if (data.type === "game_player_ready") {
          // TODO
          // update state of ready players
          navigate("/game", { state: { player_ready: data.payload.player } });
        } else if (data.type === "game_player_leave") {
          // Handle player leave
        } else if (data.type === "game_countdown") {
          // Handle countdown
        } else if (data.type === "game_question") {
          navigate("/game", {
            state: { question: data, playerName: playerName },
          });
        } else if (data.type === "game_player_correct") {
          if (data.payload.player === playerName) {
            toast.success("Correct Answer!");
          }
        } else if (data.type === "game_player_incorrect") {
          if (data.payload.player === playerName) {
            toast.error("Incorrect Answer.");
          }
        } else if (data.type === "game_end") {
          fetchLeaderboard();
          fetchGames();
          navigate("/leaderboard");
        }
      });
      setIsConnected(true);
    };

    handleConnect();

    return () => {
      api.disconnect();
      setIsConnected(false);
    };
  }, [api, playerName, navigate]);

  return { isConnected };
};
