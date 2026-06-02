
// Simple router implementation
function createRouter() {
  const routes = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: []
  };

  // Add a route
  function addRoute(method, path, handler) {
    // Convert path pattern to regex (handle :params)
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    routes[method].push({
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      handler
    });
  }

  // Match a request to a route
  function match(method, path) {
    const methodRoutes = routes[method] || [];

    for (const route of methodRoutes) {
      const match = path.match(route.regex);
      if (match) {
        // Extract params
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { handler: route.handler, params };
      }
    }
    return null;
  }

  return {
    get: (path, handler) => addRoute('GET', path, handler),
    post: (path, handler) => addRoute('POST', path, handler),
    put: (path, handler) => addRoute('PUT', path, handler),
    delete: (path, handler) => addRoute('DELETE', path, handler),
    match
  };
}

module.exports = createRouter;