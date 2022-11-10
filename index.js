const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_SECRET}:${process.env.PASSWORD_SECRET}@cluster0.v8gjvac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {

    try {
        const serviceCollection = client.db('youtubeDB').collection('services');
        const reviewCollection = client.db('youtubeDB').collection('reviews')

  
        app.post('/services', async (req, res) => {
            const query = req.body
            const result = await serviceCollection.insertOne(query);
            res.send(result)
        })

        app.get('/three-services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result);
        })


        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })








    }
    finally {

    }
}


run().catch(err => console.error(err))








app.get('/', (req, res) => {
    res.send('Youtube blog server is running');
})
app.listen(port, () => {
    console.log(`Running on port ${port}`);
})