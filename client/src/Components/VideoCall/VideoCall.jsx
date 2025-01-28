import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { io } from "socket.io-client";
import PeerService from "../../service/peer";

const VideoCall = ({ socket, roomId, username }) => {
  // const [socket, setSocket] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peers, setPeers] = useState({});
  const myVideoRef = useRef();

  useEffect(() => {
    if (!socket) return;

    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);
        myVideoRef.current.srcObject = stream;
        // socket.emit("joinRoom", { roomId, username });
        socket.emit("joinVideoCall", { roomId });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    getMediaStream();

    socket.on("userJoined", ({ userId, username }) => {
      console.log(`User ${username} (${userId}) joined the room`);
      const peer = new PeerService();
      peers[userId] = peer;
      setPeers({ ...peers });

      if (myStream) {
        myStream.getTracks().forEach((track) => {
          peer.peer.addTrack(track, myStream);
        });
      }

      peer.peer.ontrack = (event) => {
        setRemoteStreams((prevStreams) => ({
          ...prevStreams,
          [userId]: event.streams[0],
        }));
      };

      peer.peer.onnegotiationneeded = async () => {
        const offer = await peer.getOffer();
        socket.emit("peerNegotiation", { to: userId, offer });
      };
    });

    socket.on("existingUsers", (users) => {
      console.log("Existing users:", users);
      users.forEach(({ userId }) => {
        const peer = new PeerService();
        peers[userId] = peer;
        setPeers({ ...peers });

        if (myStream) {
          myStream.getTracks().forEach((track) => {
            peer.peer.addTrack(track, myStream);
          });
        }

        peer.peer.ontrack = (event) => {
          setRemoteStreams((prevStreams) => ({
            ...prevStreams,
            [userId]: event.streams[0],
          }));
        };

        peer.peer.onnegotiationneeded = async () => {
          const offer = await peer.getOffer();
          socket.emit("peerNegotiation", { to: userId, offer });
        };
      });
    });

    socket.on("peerNegotiation", async ({ from, offer, answer }) => {
      const peer = peers[from];
      if (!peer) return;

      if (offer) {
        const answer = await peer.getAnswer(offer);
        socket.emit("peerNegotiation", { to: from, answer });
      } else if (answer) {
        await peer.setRemoteDescription(answer);
      }
    });

    socket.on("userLeft", ({ userId, username }) => {
      console.log(`User ${username} (${userId}) left the room`);
      if (peers[userId]) {
        peers[userId].peer.close();
        delete peers[userId];
        setPeers({ ...peers });
      }
      setRemoteStreams((prevStreams) => {
        const newStreams = { ...prevStreams };
        delete newStreams[userId];
        return newStreams;
      });
    });

    return () => {
      // socket.emit("leaveRoom", { roomId, username });
      Object.values(peers).forEach((peer) => peer.peer.close());
    };
  }, [socket, roomId, username, myStream, peers]); // Added 'peers' to the dependency array

  return (
    <div>
      <div>Room: {roomId}</div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ width: "200px", height: "150px", margin: "5px" }}>
          <video
            ref={myVideoRef}
            autoPlay
            muted
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        {Object.entries(remoteStreams).map(([userId, stream]) => (
          <div
            key={userId}
            style={{ width: "200px", height: "150px", margin: "5px" }}
          >
            <ReactPlayer url={stream} playing width="100%" height="100%" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoCall;
