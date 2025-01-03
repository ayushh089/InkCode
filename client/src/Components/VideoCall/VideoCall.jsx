import React, { useCallback, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import peer from "../../service/peer";
const VideoCall = ({ socket }) => {
  const [myStream, setMyStream] = useState();

  return (
    <div>
      {/* <button className="" onClick={handleCallUser}>
        On
      </button> */}
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
