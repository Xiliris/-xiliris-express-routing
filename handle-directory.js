const fs = require("fs");
const path = require("path");

module.exports = function handleDirectory(context, dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file.startsWith("_")) continue;

    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      if (file.startsWith("(") && file.endsWith(")")) continue;
      handleDirectory(context, filePath);
    } else {
      if (!file.endsWith(".js") && !file.endsWith(".ts")) {
        context._log(`> Skipping file ${file}`);
        continue;
      }

      const routePath = filePath
        .replace(/\.(js|ts)$/, "")
        .replace(/^.+routes/, "")
        .replace(/\\/g, "/")
        .replace(/index$/, "")
        .replace(/\[([^\]]+)\]/g, ":$1")
        .replace(/:(GET|POST|PUT|DELETE|PATCH)-/, "");

      try {
        const route = require(filePath);
        let middlewareCount = 0;

        if (context.data.middleware) {
          middlewareCount = context.handleMiddleware(routePath, route);
        } else {
          context.app.use(routePath, route);
        }

        if (middlewareCount > 0) {
          context._log(
            `> Loading route ${routePath} with ${middlewareCount} middleware`
          );
        } else {
          context._log(`> Loading route ${routePath}`);
        }
      } catch (err) {
        context._log(`[ Error ] loading route ${routePath}: ${err.message}`);
      }
    }
  }
};
