require('dotenv').config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/csm_test';
process.env.JWT_SECRET = 'test_secret';
