const fs = require("fs");
const path = require("path");

function routeHandler(app, dir, data) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file.startsWith("_")) {
      continue;
    }

    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(path.join(dir, file));

    if (stat.isDirectory()) {
      if (file.startsWith("(") && file.endsWith(")")) {
        continue;
      }

      routeHandler(app, filePath, data);
    } else {
      if (!file.endsWith(".js")) {
        logUser(`> Skipping file ${file}`, data);
        continue;
      }

      const routePath = filePath
        .replace(".js", "")
        .replace(/^.+routes/, "")
        .replace(/\\/g, "/")
        .replace(/index$/, "")
        .replace(/\[([^\]]+)\]/g, ":$1")
        .replace(":GET-", "")
        .replace(":POST-", "")
        .replace(":PUT-", "")
        .replace(":DELETE-", "")
        .replace(":PATCH-", "");

      try {
        const route = require(filePath);
        app.use(routePath, route);
        logUser(`> Loading route ${routePath}`, data);
      } catch (err) {
        logUser(`[ Error ] loading route ${routePath}`, data);
      }
    }
  }
}

function logUser(logMessage, data) {
  const { log } = data;

  if (log) {
    console.log(`${logMessage}`);
  }
}

module.exports = routeHandler;
