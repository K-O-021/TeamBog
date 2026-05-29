import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let classes = [];

// Fetch classes for a teacher
app.get('/api/classes', (req, res) => {
  const { email } = req.query;
  const filteredClasses = classes.filter(c => c.teacherEmail === email);
  res.json(filteredClasses);
});

// Create a new class node
app.post('/api/classes', (req, res) => {
  const newClass = req.body;
  classes.push(newClass);
  res.json(newClass);
});

// Update an existing class node (e.g., for Archiving)
app.put('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  classes = classes.map(c => c.id === id ? { ...c, ...updatedData } : c);
  const updatedClass = classes.find(c => c.id === id);
  if (updatedClass) {
    res.json(updatedClass);
  } else {
    res.status(404).json({ error: "Node not found" });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`\n🚀 SNED-LINK Backend Node Active`);
  console.log(`📡 Listening on http://localhost:${PORT}\n`);
});