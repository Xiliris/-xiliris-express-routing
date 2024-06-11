const handleDirectory = require("./handle-directory");
const handleMiddleware = require("./handle-middleware");

class RouteHandler {
  constructor(app, dir, data) {
    this.app = app;
    this.dir = dir;
    this.data = data;
  }

  handleRoutes() {
    handleDirectory(this, this.dir);
  }

  handleMiddleware(routePath, route) {
    return handleMiddleware(this, routePath, route);
  }

  _log(logMessage) {
    if (this.data.log) {
      console.log(logMessage);
    }
  }
}

module.exports = RouteHandler;
