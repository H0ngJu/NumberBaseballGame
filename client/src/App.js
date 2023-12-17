import Header from "./pages/Header/Header";
import Main from "./pages/Main/Main";
import Footer from "./pages/Footer/Footer";
import JoinRoomModal from "./pages/JoinRoomModal/JoinRoomModal";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

function App() {
  const [showModal, setShowModal] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [playerNumbers, setPlayerNumbers] = useState([]);

  useEffect(() => {
    console.log(roomCode);
    if (roomCode) {
      socket.emit("joinRoom", { roomCode, numbers: playerNumbers });
    }
  }, [roomCode, playerNumbers]);

  return (
    <>
      <JoinRoomModal
        showModal={showModal}
        setShowModal={setShowModal}
        setRoomCode={setRoomCode}
        setPlayerNumbers={setPlayerNumbers}
      />
      <Header />
      <Main socket={socket} roomCode={roomCode} />
      <Footer setShowModal={setShowModal} />
    </>
  );
}

export default App;
