require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./database.js');
const { time } = require('console');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('dist'))
app.get('/questions', async (request, response) => {
  const { data, error } = await supabase.from('questions').select('*');
  
  if (error) {
    console.error('Error fetching questions:', error);
    return response.status(500).json({ error: 'Database error' });
  }
  response.json(data);
});

app.get('/users', async (request, response) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return response.status(500).json({ error: 'Database error' });
  }
  response.json(data);
});

app.get('/questions/questionanswer', async (request, response) => {
  const { data, error } = await supabase.from('questions').select('*');
  if (error) {
    console.error('Error fetching questions:', error);
    return response.status(500).json({ error: 'Database error' });
  }
  response.json(data);
});

app.get('/questions/question/:id', async (request, response) => {
  const { id } = request.params;
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('questionid', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return response.status(404).json({ error: 'Question not found' });
    }
    console.error('Error fetching user:', error);
    return response.status(500).json({ error: 'Database error' });
  }
  response.json(data);
});

app.post('/users', async (request, response) => {
  const body = request.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ username: body.username, score: body.score, topic: body.topic, time: body.time }])
    .select()
    .single();
  if (error) {
    console.error('Error creating user:', error);
    return response.status(500).json({ error: 'Database error' });
  }
  response.status(201).json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});