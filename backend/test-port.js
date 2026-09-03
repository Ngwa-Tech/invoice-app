const net = require('net');
const socket = net.createConnection(6543, 'aws-0-eu-central-1.pooler.supabase.com');

socket.on('connect', () => {
  console.log('Connected!');
  socket.end();
});

socket.on('error', (e) => {
  console.log('Failed:', e.message);
});

socket.setTimeout(8000, () => {
  console.log('Timed out after 8 seconds');
  socket.destroy();
});