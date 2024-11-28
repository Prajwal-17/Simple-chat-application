import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"

type MessageType = {
  type: string,
  name: string,
  message: string,
}

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

const App = () => {

  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket>()
  const [users, setUsers] = useState<number>(0)

  const [userName, setUserName] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")

  const [message, setMessage] = useState<string>("")
  const [allMessages, setAllMessages] = useState<MessageType[]>([])

  const sendMessage = () => {

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected or not ready");
      return;
    }

    if (message) {
      let userMessage = {
        "type": "chat",
        "payload": {
          "name": userName,
          "roomId": roomId,
          "message": message,
        }
      }
      socket.send(JSON.stringify(userMessage));
      setMessage("")
    } else {
      console.log("no messages")
    }
  }

  const joinRoom = () => {

    if (!userName || !roomId) {
      console.log("No User name or room id ");
      return;
    }

    const ws = new WebSocket(WEBSOCKET_URL)

    ws.onopen = () => {
      let payload = {
        "type": "join",
        "payload": {
          "name": userName,
          "roomId": roomId,
          "message": ""
        }
      }
      ws.send(JSON.stringify(payload))
      setIsConnected(true)
    }
    setSocket(ws)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type == "chat") {
        setAllMessages((msg) => [...msg, data])
      } else {
        setUsers(0)
        console.log(data.roomId)
      }
    };
  }

  const generateRoomId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomId = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      roomId += characters[randomIndex]
    }
    setIsConnected(false)
    setRoomId(roomId)
    return roomId
  }

  if (!isConnected) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Join a Chat Room</CardTitle>
            <CardDescription className="font-medium">temporary chat room</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <input
                className="border-2 w-full px-3 py-2 rounded-lg font-medium"
                type="text"
                placeholder="Enter your username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <input
                className="flex-grow px-3 py-2 border-2 rounded-lg rounded-r-none font-bold uppercase placeholder:normal-case placeholder:font-normal"
                maxLength={6}
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button
                onClick={generateRoomId}
                className="bg-black border-2 border-black text-white font-medium px-6 py-2 rounded-l-none rounded-lg">
                Generate
              </button>
            </div>
          </CardContent>
          <CardFooter>
            <button
              onClick={joinRoom}
              className="w-full bg-gray-500 hover:bg-black text-white py-3 font-semibold rounded-lg">
              Join Room
            </button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Real Time Chat</CardTitle>
            <CardDescription className="font-medium">temporary chat room</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex justify-between">
              <div>Room Count : {roomId}</div>
              <div>Users : {users}</div>
            </div>
            <div className="h-96 px-4 py-4 border-2">
              <div>
                {allMessages.map((msg, index) => (
                  <div key={index}>{msg.message}</div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex">
            <input
              type="text"
              className="flex-grow"
              placeholder="Type a message ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={sendMessage}
              className=" bg-gray-500 hover:bg-black text-white px-4 py-3 font-semibold rounded-lg">
              Send
            </button>
          </CardFooter>
        </Card>
      </div>
    )
  }
}


export default App