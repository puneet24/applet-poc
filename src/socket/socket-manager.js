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

import { socketInstance } from "./socket-instance";

let connections = {};

const socketUrl = 'wss://hzqpapvxa4.execute-api.eu-west-1.amazonaws.com/prod';

export const socketManager = ({ uid, roomId, socketToken }) => {
    const key = `${uid}-${roomId}`;
    if (!connections[key] || connections[key].closed) {
        connections[key] = socketInstance({ uid, roomId, url: socketUrl });
        connections[key].init(socketToken);
    }
    return connections[key];
}
