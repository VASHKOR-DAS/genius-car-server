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
        const orderCollection = client.db('geniusCar').collection('orders'); // different collection create

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

        // orders api, client site theke order korle seta db te orders route a, db er orders collection a save (insert) hye jabe
        app.post('/orders', async(req, res) => {
            const order = req.body; //client site theke data pathale seta body er majhe thake
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        // client site a user ki ki order korse(user email er oper base kore) seta sei user dekhte chaile
        app.get('/orders', async (req, res) => {
            let query = {};


            /** 
            const query = {}; // query k re-assign korte hbe
            // http://localhost:5000/orders?email=web@ph.com link a ja khujbo ta nicher console a show hbe
            console.log(req.query);
            */

            // client site a click kora email er sathe jodi req.query.email ai email ta mile tahole ai email ta 1ta email object er moddhe rakho
            // http://localhost:5000/orders?email=elon@mask.com link a jei email diye query krbo sei email diye jei jei order kora hoise seigulo show hbe
            // Amra chaile req.query.email k 1ta variable a rakhte partam
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

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