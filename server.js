import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// serve Vite build output
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Mongo settings (Compose will point to mongodb service later)
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'ignition';
let db;

async function initDb() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(dbName);
  console.log(`[api] connected to MongoDB at ${mongoUrl}, db=${dbName}`);
}
initDb().catch(err => {
  console.error('Mongo connect error:', err);
  process.exit(1);
});

// simple CRUD to prove DB usage
app.get('/api/notes', async (_req, res) => {
  const notes = await db.collection('notes').find({}).sort({ _id: -1 }).toArray();
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });
  const doc = { text, createdAt: new Date() };
  const { insertedId } = await db.collection('notes').insertOne(doc);
  res.status(201).json({ _id: insertedId, ...doc });
});

app.delete('/api/notes/:id', async (req, res) => {
  await db.collection('notes').deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(204).end();
});

// health + SPA fallback
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use((_req, res) => res.sendFile(path.join(distPath, 'index.html')));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on ${port}`));

