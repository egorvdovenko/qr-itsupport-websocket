const express = require('express');
const WebSocket = require('ws');

const app = express();

const port = process.env.PORT || 8040;
const host = process.env.HOST || '0.0.0.0';

// Create a new WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Handle HTTP requests for WebSocket upgrade
const server = app.listen(port, host, () => {
  console.log(`WebSocket server is running on http://${host}:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Express endpoint to broadcast messages to all WebSocket clients
app.use(express.json());

app.get('/', (req, res) => {
  res.send('WebSocket server is running!');
});

app.post('/broadcast', (req, res) => {
  const message = req.body.message;

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.sendStatus(200);
});
