import { WebSocketServer, WebSocket } from "ws";

//creating a web socket server
const wss = new WebSocketServer({ port: 8080 })

interface SocketType {
  socket: WebSocket,
  roomId: string,
}

let allSockets: SocketType[] = []

wss.on("connection", function connection(socket) {
  console.log("user connected");
  // allSockets.push(socket)
  // socket.send("hello from server")

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);
    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        roomId: parsedMessage.payload.roomId,
      })
      console.log(`successfully joined the room ${parsedMessage.payload.roomId}`)
    }

    if (parsedMessage.type === "chat") {
      let currentUserRoom = allSockets.find((x) => x.roomId === parsedMessage.payload.roomId)?.roomId;
      console.log("🚀 ~ socket.on ~ currentUserRoom:", currentUserRoom)


      for (let i = 0; i < allSockets.length; i++) {
        if (allSockets[i].roomId == currentUserRoom) {
          allSockets[i].socket.send(parsedMessage.payload.message);
        }
      }

      // allSockets.forEach((x) => {
      //   if (x.roomId == currentUserRoom) {
      //     socket.send(parsedMessage.payload.message)
      //   }
      // })
    }


    // if (message.toString() === "ping") {
    //   socket.send("pong")
    // }

    // allSockets.forEach((s) => {
    //   s.send(message.toString() + ":sent from server")
    // })
  })

  // socket.on("disconnect", () => {
  //   allSockets = allSockets.filter(x => x != socket)
  // })

})