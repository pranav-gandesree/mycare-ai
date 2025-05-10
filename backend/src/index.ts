// src/index.ts
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import toolsRoute from "./routes/tools"

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!'); 
});

app.use("/api/tools", toolsRoute)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
