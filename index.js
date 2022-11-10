const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




app.get('/', (req, res) => {
    res.send('Youtube blog server is running');
})
app.listen(port, () => {
    console.log(`Running on port ${port}`);
})