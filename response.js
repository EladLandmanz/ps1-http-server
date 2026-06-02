const fs = require('fs');
const path = require('path');

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create response helpers
function createResponse(socket) {
  let statusCode = 200;
  let statusText = 'OK';
  const headers = {};

  function init_response_headers(headers){
        let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
        for (const [k, v] of Object.entries(headers)) {
            response += `${k}: ${v}\r\n`;
        }
        return response;
    }

  return {
    status(code) {
      statusCode = code;
      const statusTexts = {
        200: 'OK', 201: 'Created', 400: 'Bad Request',
        404: 'Not Found', 500: 'Internal Server Error'
      };
      statusText = statusTexts[code] || 'Unknown';
      return this;
    },

    set(key, value) {
      headers[key] = value;
      return this;
    },

    json(data) {
      const body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);

    //   let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
    //   for (const [k, v] of Object.entries(headers)) {
    //     response += `${k}: ${v}\r\n`;
    //   }
      let response = init_response_headers(headers);
      response += '\r\n' + body;
      socket.end(response);
    },

    send(text) {
      headers['Content-Type'] = 'text/plain';
      headers['Content-Length'] = Buffer.byteLength(text);
    //   let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
    //   for (const [k, v] of Object.entries(headers)) {
    //     response += `${k}: ${v}\r\n`;
    //   }
      let response = init_response_headers(headers);    
      response += '\r\n' + text;
      socket.end(response);
    },
    sendFile(absolutePath) {
      fs.stat(absolutePath, (err, stats) => {
        // Handle file not found right here using our own helpers!
        if (err || !stats.isFile()) {
          this.status(404).send('404 - File Not Found');
          return;
        }

        const ext = path.extname(absolutePath).toLowerCase();
        headers['Content-Type'] = MIME_TYPES[ext] || 'application/octet-stream';
        headers['Content-Length'] = stats.size;

        let responseString = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
        for (const [key, value] of Object.entries(headers)) {
          responseString += `${key}: ${value}\r\n`;
        }
        responseString += `\r\n`;

        // Send the headers to the socket
        socket.write(responseString);

        // Stream the file bytes directly to the socket
        const readStream = fs.createReadStream(absolutePath);
        readStream.pipe(socket);
      });
    }
  };
}


module.exports = createResponse;