const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const validatetoken = require('./controllers/validatetoken');

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
    const token = jwt.sign(payload, secretKey, { expiresIn: '10m' });
    return token;
}

app.get('/', (req, res) => res.send("success"));
// Route for token validation
app.post('/validatetoken', tokenValidation, (req, res) => validatetoken.handleValidateToken(req, res, db, jwt));
app.post('/signin', (req, res) => signin.handleSignIn(req, res, db, bcrypt, generateSessionToken));
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt, generateSessionToken));
app.get('/profile/:id', tokenValidation, (req, res) => profile.handleProfile(req, res, db));
app.put('/image', tokenValidation, (req, res) => image.handleImage(req, res, db));
app.post('/clarifai', tokenValidation, (req, res) => image.handleClarifaiAPICall(req, res));

app.listen(3000, () => {
    console.log('app is running on port 3000');
});
