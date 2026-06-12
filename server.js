const net = require('net');
const fs = require('fs');
const path = require('path');

const serveStatic = require('./static')
const createRouter = require('./router')
const createResponse = require('./response')
const parseRequest = require('./parser');
const { error } = require('console');

//init the router
const router = createRouter()
// create a static server
const staticServe = serveStatic('./public')

//add routes
router.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});


//endpoint for the frontend creation
router.post('/admin/create-route', (req, res) => {
  let requestData;
    try {
        requestData = JSON.parse(req.body);
    } catch (e) {
        return res.status(400).send("Invalid JSON.");
    }

    const { method, path: newPath, responseBody } = requestData;
    const customJsonResponse = JSON.parse(responseBody);

    // 1. Inject it into live memory so it works instantly without restarting
    router.createEndpoint(method, newPath, (customReq, customRes) => {
        customRes.json(customJsonResponse);
    });

    // 2. Save it permanently to the disk
    const dbPath = require('path').resolve('./routes.json');
    try {
        // Read the current array of routes
        const existingRoutes = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        // Push the new route into the array
        existingRoutes.push({
            method: method,
            path: newPath,
            responseBody: customJsonResponse
        });

        // Write the updated array back to the file
        fs.writeFileSync(dbPath, JSON.stringify(existingRoutes, null, 2));

    } catch (err) {
        console.error("Failed to save to disk:", err);
        return res.status(500).send("Route created in memory, but failed to save to disk.");
    }

    console.log(`Created and saved new route: ${method} ${newPath}`);
    res.status(201).json({ success: true, message: "Route created and saved!" });
});

function loadPersistentRoutes(router) {
    const dbPath = path.resolve('./routes.json');
    
    try {
        // 1. Check if the file exists
        if (!fs.existsSync(dbPath)) {
            // If not, create it with an empty array
            fs.writeFileSync(dbPath, '[]');
            return;
        }

        // 2. Read the file and parse it back into a JS array
        const rawData = fs.readFileSync(dbPath, 'utf8');
        const savedRoutes = JSON.parse(rawData);

        // 3. Loop through every saved route and inject it into the router
        savedRoutes.forEach(entry => {
            router.createEndpoint(entry.method, entry.path, (req, res) => {
                res.json(entry.responseBody);
            });
            console.log(`Loaded saved route: ${entry.method} ${entry.path}`);
        });

    } catch (err) {
        console.error("Failed to load routes.json:", err.message);
    }
}

loadPersistentRoutes(router)

const server = net.createServer((socket) => {
  // 'socket' is a duplex stream representing the connection

  // Receive data from client
  socket.on('data', (data) => {
    console.log('Received:', data.toString());

    //parse the request
    const req = parseRequest(data);
    
    //create the response
    const res = createResponse(socket);
    
    //check if the request is for a static file
    if(req.path.startsWith('/static')){
        //call the static handler
        staticServe(req, res);
    
    } else {
        //check if the request matches any route
        const matched = router.match(req.method, req.path);
        if (matched){
            //match returns the handler and all the paramaters
            req.params = matched.params;
            //call the handler
            matched.handler(req, res);

        } else {
            res.status(404).json({error: 'not found'})
        }
    }


  });
    // Handle connection close
  socket.on('end', () => {
    console.log('Client disconnected');
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});


// Start listening on port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('Server listening on port 3000');
});