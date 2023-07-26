import fsModule from "fs";
import { WebSocketServer } from "ws";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fs = fsModule.promises;
const PORT = 8080;

const app = express();
app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

const wss = new WebSocketServer({ server });

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
          writeToFile(path.join(__dirname, "../data/myData.json"), data);
          break;
        case "load":
          readFile(path.join(__dirname, "../data/myData.jason")).then((contents) =>
            ws.send(contents)
          );
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

/**
 * http server
 */
app.post("/save", (req, res) => {
  console.log("http save");
  req.on("data", (data) => {
    return writeToFile(
      path.join(__dirname, "../data/myData.json"),
      JSON.parse(data)
    );
  });
});

app.get("/load", (req, res) => {
  console.log("http load");
  readFile(path.join(__dirname, "../data/myData.json"))
    .then((contents) => {
      res.status(200).json(contents);
    })
    .catch((e) => {
      console.log(e);
      res
        .status(500)
        .end(e.code === "ENOENT" ? "no record" : "something error");
    });
});
