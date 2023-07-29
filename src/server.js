import fsModule from "fs";
import { WebSocketServer } from "ws";
import path from "path";
import express from "express";
import cors from "cors";
import pathUnit from "./utils/pathUnit.js";
import parseBufferUnit from "./utils/parseBufferUnit.js";

const { __dirname } = pathUnit(import.meta.url);

const fs = fsModule.promises;
const PORT = 8080;

const app = express();
app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

const wss = new WebSocketServer({ server });

const writeToFile = (filePath, data) => {
  const jsonStr = JSON.stringify(data);
  return fs
    .writeFile(filePath, jsonStr)
    .then(() => console.log("Data written to file successfully."))
    .catch((e) => {
      console.error(`Write fail(${writeToFile.name}):`, e.message);
      return Promise.reject(
        new Error("The server has some issue, please check it.")
      );
    });
};

const readFile = (filePath) => {
  return fs
    .readFile(filePath)
    .then((contents) => JSON.stringify(JSON.parse(contents)))
    .catch((e) => {
      console.error(`Read fail(${readFile.name}):`, e.message);
      if (e.code === "ENOENT")
        return Promise.reject(new Error("Can't find the file."));
      return Promise.reject(
        new Error("The server has some issue, please check it.")
      );
    });
};

wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", (message) => {
    parseBufferUnit("json", message)
      .then(({ type, data }) => {
        switch (type) {
          case "save":
            return writeToFile(
              path.join(__dirname, "../data/myData.json"),
              data
            ).then(() => ws.send("Save success."));
          case "load":
            return readFile(path.join(__dirname, "../data/myData.json")).then(
              (contents) => ws.send(contents)
            );
          case "refresh":
            const clients = wss.clients;
            clients.forEach((client) =>
              client.send(JSON.stringify({ type: "refresh" }))
            );
            return;
          default:
            return Promise.reject(new Error(`Not support type: ${type}`));
        }
      })
      .catch((e) => {
        ws.send(e.message);
      });
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});

/**
 * http server
 */
app.post("/save", (req, res) => {
  console.log("http save");
  req.on("data", (data) => {
    parseBufferUnit("json", data)
      .then((data) =>
        writeToFile(path.join(__dirname, "../data/myData.json"), data)
      )
      .then(() => res.status(200).end("Save success."))
      .catch((e) => res.status(500).end(e.message));
  });
});

app.get("/load", (req, res) => {
  console.log("http load");
  readFile(path.join(__dirname, "../data/myData.json"))
    .then((contents) => res.status(200).json(JSON.parse(contents)))
    .catch((e) => res.status(500).end(e.message));
});
