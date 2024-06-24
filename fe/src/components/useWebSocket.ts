import { useEffect, useState } from "react";
import { Api, LobbyGame } from "../api";
import { toast } from "react-toastify";

export const useWebSocket = (playerName: string) => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [joinedGames, setJoinedGames] = useState<Set<string>>(new Set());
  const [createdGames, setCreatedGames] = useState<Set<string>>(new Set());
  const [readyGames, setReadyGames] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const api = new Api("http://localhost:8080");

  useEffect(() => {
    return () => {
      api.disconnect();
    };
  }, []);

  const handleConnect = () => {
    api.connectToServer(playerName, (event) => {
      console.log("Message from server:", event.data);
      const data = JSON.parse(event.data);

      if (data.error) {
        toast.error(`Error: ${data.error}`);
        setError(`Error: ${data.error}`);
        setIsLoading(false);
        return;
      }

      switch (data.type) {
        case "game_player_enter":
          handleGamePlayerEnter(data);
          break;
        case "game_join":
          handleGameJoin(data);
          break;
        case "game_destroy":
          handleGameDestroy(data);
          break;
        case "game_start":
          handleGameStart(data);
          break;
        case "game_player_join":
          handleGamePlayerJoin(data);
          break;
        case "game_player_ready":
          handleGamePlayerReady(data);
          break;
        case "game_player_leave":
          handleGamePlayerLeave(data);
          break;
        case "game_countdown":
          handleGameCountdown(data);
          break;
        case "game_question":
          handleGameQuestion(data);
          break;
        default:
          console.log("Unhandled event type:", data.type);
      }
      setIsLoading(false);
    });
    setIsConnected(true);
  };

  const handleGamePlayerEnter = (data) => {
    setGames((prevGames) => {
      const gameExists = prevGames.some((game) => game.id === data.id);
      if (gameExists) {
        return prevGames.map((game) =>
          game.id === data.id
            ? { ...game, players: data.payload.players }
            : game
        );
      } else {
        return [
          ...prevGames,
          { ...data.payload, players: data.payload.players },
        ];
      }
    });
    setCreatedGames((prevCreatedGames) =>
      new Set(prevCreatedGames).add(data.id)
    );
    console.log("Created Games:", createdGames);
    console.log("Joined Games:", joinedGames);
  };

  const handleGameJoin = (data) => {
    setJoinedGames((prevJoinedGames) => new Set(prevJoinedGames).add(data.id));
    console.log("Joined Games:", joinedGames);
  };

  const handleGameDestroy = (data) => {
    setGames((prevGames) => prevGames.filter((game) => game.id !== data.id));
  };

  const handleGameStart = (data) => {
    console.log("Game started:", data.id);
    // change UI to show question
    // show countdown
    // show other info
  };

  const handleGamePlayerJoin = (data) => {
    setGames((prevGames) =>
      prevGames.map((game) =>
        game.id === data.id
          ? { ...game, players: [...(game.players || []), data.payload.player] }
          : game
      )
    );
  };

  const handleGamePlayerReady = (data) => {
    setGames((prevGames) =>
      prevGames.map((game) =>
        game.id === data.id
          ? { ...game, players: [...(game.players || []), data.payload.player] }
          : game
      )
    );
  };

  const handleGamePlayerLeave = (data) => {
    setGames((prevGames) =>
      prevGames.map((game) =>
        game.id === data.id
          ? {
              ...game,
              players: (game.players || []).filter(
                (player) => player !== data.payload.player
              ),
            }
          : game
      )
    );
  };

  const handleGameCountdown = (data) => {
    console.log("Game countdown:", data);
  };

  const handleGameQuestion = (data) => {
    console.log("Game question:", data);
  };

  const fetchGames = async () => {
    try {
      const gameList = await api.fetchGameList();
      setGames(Array.isArray(gameList) ? gameList : []);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("Failed to fetch game list: " + error.message);
      } else {
        console.error(
          "An unknown error occurred while fetching the game list:",
          error
        );
        setError("An unknown error occurred. Please try again later.");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return {
    games,
    joinedGames,
    createdGames,
    readyGames,
    isConnected,
    isLoading,
    error,
    handleConnect,
    createGame: api.createGame,
    joinGame: api.joinGame,
    startGame: api.startGame,
    readyGame: api.readyGame,
  };
};
