import { WebSocketServer } from "ws";
import path from "path";
import express from "express";
import cors from "cors";
import pathUtil from "./utils/pathUtil.js";
import parseBuffer from "./utils/parseBuffer.js";
import { writeFile, readFile } from "./utils/fileUtils.js";

const { __dirname } = pathUtil(import.meta.url);

const PORT = 8080;

const app = express();
app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", (message) => {
    parseBuffer("json", message)
      .then(({ type, data }) => {
        switch (type) {
          case "save":
            return writeFile(
              path.join(__dirname, "./data/"),
              "myData.json",
              data
            ).then(() => ws.send("Save success."));
          case "load":
            return readFile(path.join(__dirname, "./data/myData.json")).then(
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
    parseBuffer("json", data)
      .then((data) =>
        writeFile(path.join(__dirname, "./data/"), "myData.json", data)
      )
      .then(() => res.status(200).end("Save success."))
      .catch((e) => res.status(500).end(e.message));
  });
});

app.get("/load", (req, res) => {
  console.log("http load");
  readFile(path.join(__dirname, "./data/myData.json"))
    .then((contents) => res.status(200).json(JSON.parse(contents)))
    .catch((e) => res.status(500).end(e.message));
});
