const PORT = process.env.PORT || 3000;
import http from 'http';
import app from './App.js';

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
