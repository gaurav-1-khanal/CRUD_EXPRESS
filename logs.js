const express = require('express');
const fs = require('fs').promises;
const app = express();

const checkUser = (req, res, next) => {
  if (req.query.validuser === 'true') return next();
  return res.status(401).send('<h1>401: Invalid User</h1>');
};
// 1. CREATE
app.get('/create', checkUser, async (req, res) => {
  const { name, todo } = req.query;
  if (!name) return res.status(400).send('<h1>400: Username is required</h1>');
  if (!todo) return res.status(400).send('<h1>400: TODO is required</h1>');
  await fs.appendFile('todo.txt', `User: ${name} | Todo: ${todo}\n`);
  return res.status(201).send(`<h1>201: User ${name} and TODO created</h1>`);
});

// 2. READING
app.get('/read', checkUser, async (req, res) => {
  try {
    const data = await fs.readFile('todo.txt', 'utf8');
    if (!data) return res.status(404).send('<h1>404: TODO list is empty</h1>');
    return res.send(`<pre>${data}</pre>`);
  } catch (err) {
    return res.status(404).send('<h1>404: No TODO list found</h1>');
  }
});
// 3. UPDATE: new  entry
app.get('/update', checkUser, async (req, res) => {
  const { name, todo, 'new-value': newValue } = req.query;
  if (!name) return res.status(400).send('<h1>400: Username is required</h1>');
  if (!todo) return res.status(400).send('<h1>400: TODO is required</h1>');
  if (!newValue) return res.status(400).send('<h1>400: new-value is required</h1>');
  try {
    let data = await fs.readFile('todo.txt', 'utf8');
    if (!data.includes(`User: ${name}`)) {
      return res.status(404).send(`<h1>404: User "${name}" not found</h1>`);
    }
    if (!data.includes(`User: ${name} | Todo: ${todo}`)) {
      return res.status(404).send(`<h1>404: User "${name}" exists, but TODO not found</h1>`);
    }
    data = data.replace(`User: ${name} | Todo: ${todo}`, `User: ${name} | Todo: ${newValue}`);
    await fs.writeFile('todo.txt', data);
    return res.status(200).send(`<h1>200: TODO updated for ${name}</h1>`);
  } catch (err) {
    return res.status(500).send('<h1>500: Error reading file</h1>');
  }
});
// 4. DELETE: Remove entry
app.get('/delete', checkUser, async (req, res) => {
  const { name, todo } = req.query;
  if (!name) return res.status(400).send('<h1>400: Username is required</h1>');
  if (!todo) return res.status(400).send('<h1>400: TODO is required</h1>');
  try {
    let data = await fs.readFile('todo.txt', 'utf8');
    const target = `User: ${name} | Todo: ${todo}\n`;
    if (!data.includes(`User: ${name}`)) {
      return res.status(404).send(`<h1>404: User "${name}" not found</h1>`);
    }
    if (!data.includes(target)) {
      return res.status(404).send(`<h1>404: User "${name}" exists, but TODO not found</h1>`);
    }
    data = data.replace(target, '');
    await fs.writeFile('todo.txt', data);
    return res.status(200).send(`<h1>200: Deleted TODO for ${name}</h1>`);
  } catch (err) {
    return res.status(500).send('<h1>500: Error reading file</h1>');
  }
});

app.listen(8000, () => console.log('Server on http://localhost:8000'));