import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import session from 'express-session';
import crypto from 'crypto';
import {
  exchangeCodeForAccessToken,
  createZoomDeeplink,
} from "./lib/zoom-api.js";
import http from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// ---------------------------------------------------------------------
// COEP + COOP + CORP (all HTML must get CORP=cross-origin)
// ---------------------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  next();
});

// Helmet + Zoom-safe CSP
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        frameAncestors: [
          "'self'",
          "https://*.zoom.us",
          "https://*.zoom.com",
        ],
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://appssdk.zoom.us",
          "https://source.zoom.us",
          "https://cdn.ngrok.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.ngrok.com"],
        fontSrc: ["'self'", "data:", "https://cdn.ngrok.com"],
        connectSrc: [
          "'self'",
          "wss:",
          "https://zoom.us",
          "https://*.zoom.us",
          "https://*.ngrok.app",
          "https://*.ngrok.io",
        ],
      },
    },
  })
);

// Static assets with CORP
app.use((req, res, next) => {
  if (req.path.endsWith(".html") || req.path === "/") {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'zcc-apps.html'));
  
});

// OAuth start
app.get('/auth/start', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const authorize = new URL('https://zoom.us/oauth/authorize');
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ZOOM_CLIENT_ID,
    redirect_uri: process.env.ZOOM_REDIRECT_URI,
    state,
  }).toString();

  res.redirect(authorize.toString());
});

// OAuth callback
app.get('/auth/callback', async (req, res, next) => {
  try {
    const { code } = req.query;

    const token = await exchangeCodeForAccessToken({
      code,
      redirectUri: process.env.ZOOM_REDIRECT_URI,
      clientId: process.env.ZOOM_CLIENT_ID,
      clientSecret: process.env.ZOOM_CLIENT_SECRET,
    });

    const deeplink = await createZoomDeeplink({
      accessToken: token.access_token,
      payload: {
        action: "openApp",
        type: 1,
      },
    });

    return res.redirect(deeplink);
  } catch (e) {
    next(e);
  }
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
