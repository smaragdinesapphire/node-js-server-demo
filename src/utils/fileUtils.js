import fs from "fs/promises";

export const createFolder = (folderPath) =>
  fs.access(folderPath, fs.constants.F_OK).catch(() => {
    console.log("資料夾不存在，建立中...");
    return fs
      .mkdir(folderPath, { recursive: true })
      .catch((e) => Promise.reject(new Error(`建立資料夾失敗: ${e.message}`)));
  });

export const writeFile = (folderPath, filename, data) => {
  const jsonStr = JSON.stringify(data);
  const filePath = `${folderPath}\\${filename}`;
  return createFolder(folderPath)
    .then(() => fs.writeFile(filePath, jsonStr))
    .then(() => console.log("Data written to file successfully."))
    .catch((e) => {
      console.error(`Write fail(${writeFile.name}):`, e.message);
      return Promise.reject(
        new Error("The server has some issue, please check it.")
      );
    });
};

export const readFile = (filePath) => {
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
