const path = require('path');
//static file serving
function serveStatic(baseDir){

    return function handleStaticRequest(req, res) {
    
        const filePath = path.join(baseDir, req.path.replace('/static', ''));
        const resolvedPath = path.resolve(filePath);
        console.log("resolving path")
        console.log(resolvedPath)
        const resolvedBase = path.resolve(baseDir);

        // Security check
        if (!resolvedPath.startsWith(resolvedBase)) {
            return res.status(403).send('Access Denied');
        }

        // send the file using the response given
        res.sendFile(resolvedPath);
  };
}

module.exports = serveStatic;
