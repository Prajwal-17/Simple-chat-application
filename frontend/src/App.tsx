import { useEffect, useRef, useState } from "react"

const App = () => {

  const [socket, setSocket] = useState()
  const inputRef = useRef();

  function sendMessage() {
    const message = inputRef.current.value;
    socket.send(message)
  }

  useEffect(() => {

    const ws = new WebSocket("ws://localhost:8080")
    setSocket(ws)

    ws.onmessage = (ev) => {
      alert(ev.data)
    }

  }, [])

  return (
    <div>
      <h1 className="text-red-500">Chat Application</h1>
      <input ref={inputRef} type="text" placeholder="send a message" />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default App