import React, { useCallback, useState, useContext, useEffect } from "react";
import ReactPlayer from "react-player";
import peer from "../../service/peer";
import { UserContext } from "../../pages/HomePage";
const VideoCall = ({ socket }) => {
  const [myStream, setMyStream] = useState();
  //   const { socket } = useContext(UserContext);
  console.log("HEy" + socket);
  useEffect(() => {
    if (socket) {
      return () => {};
    }
  }, [socket]);
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    setMyStream(stream);
  }, []);
  return (
    <div>
      <button className="btn btn-primary" onClick={handleCallUser}>
        call
      </button>
      <div>
        {myStream && (
          <ReactPlayer
            url={myStream}
            playing
            muted
            width="100px"
            height="100px"
          ></ReactPlayer>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
