import { Axios } from "axios";

export interface LobbyGame {
  id: string;
  name: string;
  questionCount: number;
  state: "waiting" | "countdown" | "question" | "ended";
  playerCount: number;
  players?: string[];
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
      return response.data as LobbyGame[];
    } catch (error) {
      console.error("Error fetching game list:", error);
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
            this.onMessage(event); // Pass the message to the provided onMessage handler
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
          setTimeout(connect, 1000); // Try to reconnect after 1 second
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
    }
  };

  createGame = (name: string, questionCount: number) => {
    const message = {
      type: "create",
      nonce: this.generateNonce(),
      payload: {
        name,
        questionCount,
      },
    };
    this.sendMessage(message);
  };

  joinGame = (gameId: string) => {
    const message = {
      type: "join",
      nonce: this.generateNonce(),
      payload: {
        game_id: gameId,
      },
    };
    this.sendMessage(message);
  };

  readyGame = (gameId: string) => {
    const message = {
      type: "ready",
      nonce: this.generateNonce(),
      payload: {
        game_id: gameId,
      },
    };
    this.sendMessage(message);
  };

  startGame = (gameId: string) => {
    const message = {
      type: "start",
      nonce: this.generateNonce(),
      payload: {
        game_id: gameId,
      },
    };
    this.sendMessage(message);
  };
}
