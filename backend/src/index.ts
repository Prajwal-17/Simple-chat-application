import { WebSocketServer, WebSocket } from "ws";

//creating a web socket server
const wss = new WebSocketServer({ port: 8080 })

interface SocketType {
  socket: WebSocket,
  roomId: string,
}

//Schema of incoming message
// {
//   "type":"join/chat",
//   "payload":{
//       "name":"abc",
//       "roomId":"123456",
//       "message":"helo"
//   }
// }

let allSockets: SocketType[] = []

wss.on("connection", function connection(socket) {
  console.log("user connected");

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);

    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        roomId: parsedMessage.payload.roomId,
      })
      // let totalUsers = allSockets.length;
      let joinMsg = {
        // "users": totalUsers,
        "roomId": parsedMessage.payload.roomId,
      }
      socket.send(JSON.stringify(joinMsg))
    }

    if (parsedMessage.type === "chat") {
      let currentUserRoom = allSockets.find((x) => x.roomId === parsedMessage.payload.roomId)?.roomId;

      for (let i = 0; i < allSockets.length; i++) {
        if (allSockets[i].roomId == currentUserRoom) {
          const broadcastMsg = {
            type: "chat",
            name: parsedMessage.payload.name,
            message: parsedMessage.payload.message,
          }
          allSockets[i].socket.send(JSON.stringify(broadcastMsg));
        }
      }
    }
  })

  socket.on("close", () => {
    console.log("User disconnected");
    allSockets = allSockets.filter((client) => client.socket !== socket);
  });

  socket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
})