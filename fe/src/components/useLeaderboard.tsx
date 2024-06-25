// useLeaderboard.ts
import { useState } from "react";
import { Api } from "./api";
import { AxiosError } from "axios";

const useLeaderboard = (api: Api) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const leaderboardResults = await api.fetchLeaderboard();
      setLeaderboard(leaderboardResults);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("Failed to fetch leaderboard: " + error.message);
      } else {
        setError("An unknown error occurred. Please try again later.");
      }
    }
    setIsLoading(false);
  };

  return { leaderboard, isLoading, error, fetchLeaderboard };
};
