This code provides an infrastructure to build web apps.
it supports static file serving and routing.

You can add routes in three ways:

1. express style:
    router.get('/api/hello', (req, res) => {
        res.json({ message: 'Hello, World!' });
    });
2. add the method, path and response json to the routes.json file. when the server initiates, the routes will be added and available. 
    for example add this to to the file:
    [
    {
    "method": "GET",
    "path": "/api/hello",
    "responseBody":{
        "message":"Hello, World!"
        }
    } 
    ]
3. Simple frontend GUI - When entering the url http://localhost:3000/static/admin.html after initiating the server, you will be ppresented with a simple GUI to add routes dynamically without needing to restart the server. the routes will also be saved to the same routes.json and will persist if you restart the server.