const fs = require("fs");
const path = require("path");

function routeHandler(app, dir, data) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file.startsWith("_")) continue;

    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      if (file.startsWith("(") && file.endsWith(")")) continue;
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
        .replace(/:(GET|POST|PUT|DELETE|PATCH)-/, "");

      try {
        const route = require(filePath);
        let middlewareCount = 0;

        if (data.middleware) {
          middlewareCount = applyMiddleware(app, data, routePath, route);
        } else {
          app.use(routePath, route);
        }

        if (middlewareCount > 0) {
          logUser(
            `> Loading route ${routePath} with ${middlewareCount} middleware`,
            data
          );
        } else {
          logUser(`> Loading route ${routePath}`, data);
        }
      } catch (err) {
        logUser(`[ Error ] loading route ${routePath}: ${err.message}`, data);
      }
    }
  }
}

function applyMiddleware(app, data, routePath, route) {
  const { middleware: middlewareConfigs } = data;
  let appliedMiddlewareCount = 0;

  for (const config of middlewareConfigs) {
    const { path, middlewares } = config;

    if (!path || !middlewares) {
      throw new Error(
        "Middleware configuration must have a path and middlewares"
      );
    }

    if (routePath === path || routePath.startsWith(path)) {
      app.use(routePath, ...middlewares, route);
      appliedMiddlewareCount += middlewares.length;
    }
  }

  return appliedMiddlewareCount;
}

function logUser(logMessage, data) {
  if (data.log) {
    console.log(logMessage);
  }
}

module.exports = routeHandler;
