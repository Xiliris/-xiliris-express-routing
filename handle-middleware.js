module.exports = function handleMiddleware(context, routePath, route) {
  const { middleware: middlewareConfigs } = context.data;
  let appliedMiddlewareCount = 0;

  if (middlewareConfigs) {
    for (const config of middlewareConfigs) {
      const { path, middlewares } = config;

      if (!path || !middlewares) {
        throw new Error(
          "Middleware configuration must have a path and middlewares"
        );
      }

      if (routePath === path || routePath.startsWith(path)) {
        context.app.use(routePath, ...middlewares, route);
        appliedMiddlewareCount += middlewares.length;
      }
    }
  }

  return appliedMiddlewareCount;
};
