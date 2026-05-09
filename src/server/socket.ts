import { Server as SocketIOServer } from "socket.io";
import { MyMinfinAgent } from "./agent";

export function setupSocket(server: any) {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Client connected for agent session");

    socket.on("start_declaration", async (task) => {
      const agent = new MyMinfinAgent((update) => {
        socket.emit("agent_update", update);
      });

      try {
        await agent.run(task);
      } catch (error) {
        socket.emit("agent_update", { status: "error", message: "Fatal error" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected, agent session cleanup");
    });
  });

  return io;
}
