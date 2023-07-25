const fs = require("fs").promises;
const WebSocket = require("ws");
const path = require("path");

const wss = new WebSocket.Server({ port: 8080 });

const writeToFile = (path, data) => {
  const jsonStr = JSON.stringify(data);
  return fs
    .writeFile(path, jsonStr)
    .then(() => console.log("Data written to file successfully."))
    .catch((err) => {
      console.error("Error writing to file:", err);
      return Promise.reject();
    });
};

const readFile = (path) => {
  return fs
    .readFile(path)
    .then((contents) => JSON.stringify(JSON.parse(contents)));
};

wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", (message) => {
    try {
      const { type, data } = JSON.parse(message);

      switch (type) {
        case "save":
          writeToFile(path.join(__dirname, "../data/data.log"), data);
          break;
        case "load":
          readFile(path.join(__dirname, "../data/data.log")).then((contents) => ws.send(contents));
          break;
        default:
          throw Error();
      }
    } catch (error) {
      console.error("Invalid JSON:", message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});
