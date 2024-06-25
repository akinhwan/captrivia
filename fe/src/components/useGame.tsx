// useGames.ts
import { useState } from "react";
import { Api, LobbyGame } from "./api";
import { AxiosError } from "axios";

const useGames = (api: Api) => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const gameList = await api.fetchGameList();
      setGames(gameList);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("Failed to fetch game list: " + error.message);
      } else {
        setError("An unknown error occurred. Please try again later.");
      }
    }
    setIsLoading(false);
  };

  return { games, isLoading, error, fetchGames };
};
