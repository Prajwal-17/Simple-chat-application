import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { toast } from "sonner";

type MessageType = {
  type: string,
  name: string,
  message: string,
}

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

const App = () => {

  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket>()
  const [roomDisabled, setRoomDisabled] = useState(false)

  const [userName, setUserName] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")

  const [message, setMessage] = useState<string>("")
  const [allMessages, setAllMessages] = useState<MessageType[]>([])

  const sendMessage = () => {

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected or not ready");
      toast.error("WebSocket not connected or not ready")
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
    setRoomDisabled(true)

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
      toast.success("Successfully joined room")
    }
    setSocket(ws)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type == "chat") {
        setAllMessages((msg) => [...msg, data])
      } else {
        console.log(data.roomId)
      }
    };

    ws.onerror = () => {
      toast.error("Failed to connect to server")
      setRoomDisabled(false)
    }
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
    toast.success("Room ID generated")
    return roomId
  }

  const handleRoomCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        toast.info("Copied !!")
      })
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
              disabled={roomDisabled}
              className={`w-full bg-black hover:bg-gray-800 text-white py-3 font-semibold rounded-lg `}>
              {roomDisabled ? (
                <span>Joining room ...</span>
              ) : (
                <span>Join room</span>
              )}
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
            <div className="flex justify-between bg-gray-200 px-3 py-2 rounded-xl">
              <div className="flex items-center">
                Room ID : <span className="font-semibold">{roomId}</span>
                <svg onClick={handleRoomCopy} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-copy text-gray-600 mx-2 hover:cursor-pointer hover:text-black"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
              </div>
            </div>
            <div className="h-96 px-2 py-2 border-2 rounded-lg overflow-auto">
              <div>
                {allMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${userName === msg.name ? "text-right" : "text-left"} ${index === 0 ? "mt-2" : "my-5"} `}
                  >
                    <div className="bg-[#171717] text-white px-2 py-2 rounded-xl break-words max-w-[80%] inline-block">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <input
              type="text"
              className="flex-grow border-2 py-3 px-3 rounded-lg "
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