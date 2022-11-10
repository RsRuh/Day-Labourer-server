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


function verifyJWT(req, res, next){
    
    const authHeader = req.headers.authorization;
    if(!authHeader){
           return res.status(401).send({message: 'Unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(401).send({message: 'Unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {

    try {
        const serviceCollection = client.db('youtubeDB').collection('services');
        const reviewCollection = client.db('youtubeDB').collection('reviews')


        app.post('/jwt', (req, res) =>{
            const user = req.body;
            var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h'})
            res.send({token})
        })  
      


  
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

        
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const feedback = req.body.feedback
            console.log(id, feedback);
            const query = { _id: ObjectId(id) }
            const updatedReview = {
                $set: {
                    feedback: feedback
                }
            }
            const result = await reviewCollection.updateOne(query, updatedReview);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
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