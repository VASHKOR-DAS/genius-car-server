const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const app = express();
// process.env a jodi kono port thake tahole seta use koro nahole 5000 use koro
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

/** 
console.log(process.env.DB_USER) // .env te jei nam dclm
console.log(process.env.DB_PASSWORD) // .env te jei nam dclm
*/

// paste copy from form db
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbb4jrx.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri); //for check uri

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('geniusCar').collection('services');

        // db to get all data
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // dynamically get a info on db
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });
    }
    finally {

    }
}
run().catch(err => console.error(err))
















app.get('/', (req, res) => {
    res.send('genius car server is running')
})











app.listen(port, () => {
    console.log(`Genius car service running on ${port}`);
})