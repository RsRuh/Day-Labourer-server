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


        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/reviews', async(req, res)=>{

            let query = {};

            if (req.query.id) {
                query = {
                    categoryId: req.query.id
                }
            }
            const cursor = reviewCollection.find(query).sort({ $natural: -1 })
            const review = await cursor.toArray()
            res.send(review)
        })

        app.post('/reviews', async(req, res)=>{
            const review = req.body;
            const cursor = await reviewCollection.insertOne(review)
            res.send(cursor)
        })

        app.get('/my-reviews', verifyJWT, async(req, res)=>{
            const decoded = req.decoded;
            if(decoded?.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})              
            }
           
            let query = {};
            if(query){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({ $natural: -1 })
            const result = await cursor.toArray()
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