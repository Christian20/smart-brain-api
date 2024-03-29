import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';
import handleRegister from './controllers/register.js';
import handleSignIn from './controllers/signin.js';
import handleProfile from './controllers/profile.js';
import { handleImage, handleClarifaiAPICall } from './controllers/image.js';
import handleValidateToken from './controllers/validatetoken.js';

// const db = knex({
//   client: 'pg',
//   connection: {
//       host: '127.0.0.1',
//       user: 'postgres',
//       password: 'admin',
//       database: 'smart-brain'
//   }
// });

const db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      host: process.env.DATABASE_HOST,
      port: 5432,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PW,
      database: process.env.DATABASE_DB
    }
});

const jwtTokenExpiration = process.env.JWT_TOKEN_EXPIRATION;

const app = express();

app.use(express.json());
app.use(cors());

const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};
const secretKey = generateSecretKey();

// Middleware for token validation
const tokenValidation = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
  
      req.user = decoded; // Store the decoded information in the request for later use
      next();
    });
  };

// Function to generate a session token
function generateSessionToken(user) {   
    // Customize the token payload as needed (e.g., include user information)
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      entries: user.entries,
      joined: user.joined
    };

    // Sign the token with a secret key and set an expiration time
    const token = jwt.sign(payload, secretKey, { expiresIn: jwtTokenExpiration });
    return token;
}

app.get('/', (req, res) => res.send("success"));
// Route for token validation
app.post('/validatetoken', tokenValidation, (req, res) => handleValidateToken(req, res, db, jwt));
app.post('/signin', (req, res) => handleSignIn(req, res, db, bcrypt, generateSessionToken));
app.post('/register', (req, res) => handleRegister(req, res, db, bcrypt, generateSessionToken));
app.get('/profile/:id', tokenValidation, (req, res) => handleProfile(req, res, db));
app.put('/image', tokenValidation, (req, res) => handleImage(req, res, db));
//app.post('/clarifai', tokenValidation, (req, res) => handleClarifaiAPICall(req, res));
app.post('/clarifai', (req, res) => handleClarifaiAPICall(req, res, ClarifaiStub, grpc));

app.listen(3000, () => {
    console.log('app is running on port 3000');
});
