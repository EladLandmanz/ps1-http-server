const net = require('net');

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

router.get('/api/grodos', (req, res) => {
    res.json({loren: "loren?"})
})

//will decide on it later
router.get('/api/specialty', (req, res) => {
  res.json({ message: 'Hello, World!, specioal' });
});

router.post('/api/users', (req, res) => {
  // req.body contains parsed JSON
  const { name, email } = req.body;
  res.status(201).json({
    id: Date.now(),
    name,
    email,
    created: true
  });
});

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