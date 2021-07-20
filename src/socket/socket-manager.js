// Example on getting socket instance
// const socketInstance = socketManager({ uid, roomId })

/*
  const unsubscribeSocketConnect = socketInstance.onConnect(() => {});
  const unsubscribeSocketMessage = socketInstance.onMessage((data) => {});
*/

// Example send message to other users
// socketInstance.send({target:"*",state:{hello:"World!"}});

// Example request state on socket
// socketInstance.requestState();

// Example update state on socket
// socketInstance.updateState({hello:"World!"});

// Example close socket
// socketInstance.close();
// Note that this action will remove all event listeners from this instance and mark it close

import { api__getWebsocketToken } from "./../index";
import { socketInstance } from "./socket-instance";
import { config } from "../../config";

let connections = {};

export const socketManager = ({ uid, roomId, socketToken }) => {
    const key = `${uid}-${roomId}`;
    if (!connections[key] || connections[key].closed) {
        connections[key] = socketInstance({ uid, roomId, url });
        connections[key].init(socketToken);
    }
    return connections[key];
}
