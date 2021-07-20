let messages = [];
const batchProcessingTime = 1;
let batchSize = 100;
let batchProcessingController = null;
let processing = false;
let batchProcessInterval = null;

const clear = () => {
  if (batchProcessingController) {
    clearInterval(batchProcessingController);
  }
};

const processMessage = ({ msg, forceProcess = false }) => {
  if (msg) {
    messages.push(msg);
  }
  // if (processing) {
  //   return;
  // }
  if (messages.length >= batchSize || (forceProcess && messages.length > 0)) {
    processing = true;
    const allMSgsToBeProcessed = messages.splice(0, batchSize);
    window.socketInstance.send({
      type: "COMMAND",
      state: allMSgsToBeProcessed.map(_ => _.state)
    });
    processing = false;
  }
};

export const AppletbatchProcessor = {
  init: ({ socketInstance }) => {
    window.socketInstance = socketInstance;
    // if (batchProcessInterval) {
    //   clearInterval(batchProcessInterval);
    // }
    batchProcessInterval = setInterval(() => {
      processMessage({ forceProcess: true });
    }, batchProcessingTime * 1000);
  },
  processMessage: processMessage,
  clear: clear
};
