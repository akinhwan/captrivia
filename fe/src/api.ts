import { Axios } from "axios";
import { triggerToast } from "./App";

export interface LobbyGame {
  id: string;
  name: string;
  question_count: number;
  state: "waiting" | "countdown" | "question" | "ended";
  player_count: number;
  players?: string[];
}

export interface Player {
  player_name: string;
  accuracy: number;
  average_milliseconds: number;
  correct_questions: string;
  time_milliseconds: string;
  total_questions: string;
  last_update: string;
}

export class Api {
  url: string;
  client: Axios;
  socket: WebSocket | null = null;
  playerName: string | null = null;
  onMessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    this.url = url;
    this.client = new Axios({ baseURL: url });
  }

  fetchGameList = async (): Promise<LobbyGame[]> => {
    try {
      const response = await this.client.get("/games");
      if (response.status !== 200) {
        throw new Error("Failed to fetch game list");
      }
      return JSON.parse(response.data) as LobbyGame[];
    } catch (error) {
      console.error("Error fetching game list:", error);
      throw error;
    }
  };

  fetchLeaderboard = async (): Promise<Player[]> => {
    try {
      const response = await this.client.get("/leaderboard");
      if (response.status !== 200) {
        throw new Error("Failed to fetch leaderboard");
      }
      return JSON.parse(response.data) as Player[];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  };

  connectToServer = (
    playerName: string,
    onMessage: (event: MessageEvent) => void
  ): void => {
    this.playerName = playerName;
    this.onMessage = onMessage;

    const connect = () => {
      if (this.socket) {
        this.socket.close();
      }

      const wsUrl =
        this.url.replace("http", "ws") + `/connect?name=${playerName}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("Connected to server");
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (this.onMessage) {
          if (
            data.type === "game_player_join" ||
            data.type === "game_player_leave"
          ) {
            this.onMessage(event);
          } else {
            this.onMessage(event);
          }
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.socket.onclose = (event) => {
        console.log("Disconnected from server", event);
        if (event.code !== 1000) {
          // Reconnect only if not a normal close
          setTimeout(connect, 1000);
        }
      };
    };

    connect();
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  };

  private generateNonce = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  sendMessage = (message: object) => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open");
      triggerToast("WebSocket is not open");
    }
  };

  createGame = (name: string, question_count: number) => {
    const message = {
      type: "create",
      nonce: this.generateNonce(),
      payload: {
        name,
        question_count,
      },
    };
    this.sendMessage(message);
  };

  joinGame = (game_id: string) => {
    const message = {
      type: "join",
      nonce: this.generateNonce(),
      payload: {
        game_id,
      },
    };
    this.sendMessage(message);
  };

  readyGame = (game_id: string) => {
    const message = {
      type: "ready",
      nonce: this.generateNonce(),
      payload: {
        game_id,
      },
    };
    this.sendMessage(message);
  };

  startGame = (game_id: string) => {
    const message = {
      type: "start",
      nonce: this.generateNonce(),
      payload: {
        game_id,
      },
    };
    this.sendMessage(message);
  };

  answerGame = (game_id: string, index: number, question_id: string) => {
    const message = {
      type: "answer",
      nonce: this.generateNonce(),
      payload: {
        game_id,
        index,
        question_id,
      },
    };
    this.sendMessage(message);
  };
}
