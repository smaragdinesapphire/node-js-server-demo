import { fileURLToPath } from "url";
import path from "path";

// 取得路徑的工具，其中 filePath 會是 import.meta.url
const pathUnit = (filePath) => {
  const __filename = fileURLToPath(filePath);
  const __dirname = path.dirname(__filename);

  return { __filename, __dirname };
};
export default pathUnit;
