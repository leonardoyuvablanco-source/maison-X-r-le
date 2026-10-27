// server.js
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cors()); // Permet à ton front-end (Composer) d'appeler le serveur

// Historique de chat côté serveur (optionnel)
let chatHistory = [];

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: 'Message vide' });

  if (!process.env.OPENAI_API_KEY) {
    return res.json({ error: "Clé OpenAI manquante : ajoute OPENAI_API_KEY dans les secrets." });
  }

  // Ajoute le message à l'historique
  chatHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // ou "gpt-4"
        messages: chatHistory,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI:', data?.error?.message || response.status);
      return res.json({ error: 'OpenAI a refusé la requête' });
    }
    const reply = data.choices[0].message.content;

    // Ajoute la réponse à l'historique
    chatHistory.push({ role: 'assistant', content: reply });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ error: 'Impossible de contacter OpenAI' });
  }
});

// Sert les pages HTML du projet (index.html.html est la page d'accueil).
// Les pages n'ont pas toutes le même encodage (Latin-1 ou UTF-8) et le déclarent
// dans <meta charset> : on ne force donc pas de charset dans l'en-tête HTTP.
const htmlHeaders = {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
  },
};
app.use(express.static(__dirname, htmlHeaders));
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'index.html.html'), {
    headers: { 'Content-Type': 'text/html' },
  }),
);

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur lancé sur le port ${PORT}`));
