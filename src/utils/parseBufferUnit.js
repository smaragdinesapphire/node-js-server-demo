const parseJSON = (dataStr) =>
  new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(dataStr));
    } catch (e) {
      reject(new Error("Data is not JSON format"));
    }
  });

const parseBufferUnit = (type, data) => {
  const dataStr = data.toString();
  switch (type) {
    case "json":
      return parseJSON(dataStr);
    case "string":
      return Promise.resolve(dataStr);
    default:
      return Promise.reject(new Error(`Not support parsing type: ${type}`));
  }
};

export default parseBufferUnit;
