import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
    console.log("🔌 Socket connecting...")
  }
  return s
}

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect()
    console.log("❌ Socket disconnected")
  }
}
