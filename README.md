# Ollama Web

Minimal React app (Vite) that posts to `http://localhost:11434/v1/chat/completions`.

## Setup

1. `cd ollama-web`
2. `npm install`
3. `npm run dev`

## Usage

- Enter prompt
- Click `Send to Ollama`
- Result appears in response panel

## Deploy to GitHub Pages

1. set `homepage` in `package.json` to `https://<username>.github.io/<repo>`
2. `npm run deploy`

## Note

GitHub Pages serves HTTPS; some browsers block HTTP to localhost. For production, use a secure proxy or a server-side relay.
