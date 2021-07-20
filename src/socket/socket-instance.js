import Sockette from "sockette";

const PING_INTERVAL = 150000;

const isJSON = function(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return false;
  }
};

const getSocketData = ({
  uid,
  roomId,
  target = "*",
  type = "COMMAND",
  state = {},
  action = "GLOBAL_STATE",
  updateState = false
}) => ({
  action: "sendMessage",
  body: {
    version: "1.0",
    type,
    payload: {
      action: action,
      updateState,
      state
    },
    priority: 3,
    senderDetails: {
      uid,
      roomId
    },
    target,
    relatedMessageId: "",
    sentAt: new Date().toISOString(),
    forwardedAt: null
  }
});

const getSocketMessage = ({ data }) => {
  const json = isJSON(data);
  if (json && json.body) {
    return {
      target: json.body.target,
      type: json.body.type,
      state: json.body.payload ? json.body.payload.state : {}
    };
  } else {
    return data;
  }
};

const newEvents = () => ({
  onConnect: {},
  onMessage: {},
  onReconnect: {},
  onMaximum: {},
  onClose: {},
  onError: {}
});

export const socketInstance = function({ uid, roomId, url }) {
  let events = newEvents();

  let ws = {
    closed: false,
    onConnect: callback => subscribe("onConnect", callback),
    onMessage: callback => subscribe("onMessage", callback),
    onReconnect: callback => subscribe("onReconnect", callback),
    onMaximum: callback => subscribe("onMaximum", callback),
    onClose: callback => subscribe("onClose", callback),
    onError: callback => subscribe("onError", callback),
    init: function(token) {
      let pollId = null;

      const socket = new Sockette(`${url}?token=${token}`, {
        timeout: 5e3,
        maxAttempts: 5,
        onopen: e => {
          pollId = setInterval(() => {
            socket.json({
              action: "sendMessage",
              body: { data: "PING" }
            });
          }, PING_INTERVAL);
          Object.keys(events.onConnect).forEach(k => {
            events.onConnect[k](e);
          });
          ws.connected = true;
        },
        onmessage: e => {
          const msg = getSocketMessage(e);
          Object.keys(events.onMessage).forEach(k => {
            events.onMessage[k](msg);
          });
        },
        onreconnect: e => {
          Object.keys(events.onReconnect).forEach(k => {
            events.onReconnect[k](e);
          });
        },
        onmaximum: e => {
          Object.keys(events.onMaximum).forEach(k => {
            events.onMaximum[k](e);
          });
        },
        onclose: e => {
          pollId && clearInterval(pollId);
          Object.keys(events.onClose).forEach(k => {
            events.onClose[k](e);
          });
        },
        onerror: e => {
          pollId && clearInterval(pollId);
          Object.keys(events.onError).forEach(k => {
            events.onError[k](e);
          });
        }
      });

      ws.send = function(options) {
        const json = getSocketData({ uid, roomId, ...options });
        socket.json(json);
      };

      ws.requestState = function() {
        const json = getSocketData({ uid, roomId, type: "REQUEST_STATE" });
        socket.json(json);
      };

      ws.updateState = function(state) {
        const json = getSocketData({
          uid,
          roomId,
          type: "COMMAND",
          updateState: true,
          state
        });
        socket.json(json);
      };

      ws.close = function() {
        socket.close();
        events = newEvents();
        ws.closed = true;
        ws.connected = false;
      };

      delete ws.init;
    }
  };

  let i = 0;

  const subscribe = function(event, callback) {
    i++;
    const k = i;
    if (!events[event]) {
      events[event] = {};
    }
    events[event][k] = callback;
    return () => {
      delete events[event][k];
    };
  };

  return ws;
};
