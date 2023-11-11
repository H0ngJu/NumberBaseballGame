import "./App.css";
import Main from "./pages/Main/Main";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Footer from "./pages/Footer/Footer";
import JoinRoomModal from "./pages/JoinRoomModal/JoinRoomModal";

const socket = io.connect("http://localhost:5000");

function App() {
  const [showModal, setShowModal] = useState(false);
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    console.log("hello", roomCode);
    if (roomCode) {
      socket.emit("joinRoom", roomCode);
    }
  }, [roomCode]);

  return (
    <>
      <JoinRoomModal
        showModal={showModal}
        setShowModal={setShowModal}
        setRoomCode={setRoomCode}
      />
      <Main socket={socket} />
      <Footer setShowModal={setShowModal}></Footer>
    </>
  );
}

export default App;
