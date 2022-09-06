import 'dotenv/config';
import './db';
import './models/Video';
import './models/User';
import './models/Comment';
import app from './server';

const PORT = 50000;

const handleServer = () =>
  console.log(`✅ Server is connected on http://localhost:${PORT}`);

app.listen(PORT, handleServer);
