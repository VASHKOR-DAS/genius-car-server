const express = require('express');
const cors = require('cors');

const jwt = require('jsonwebtoken');

// write console to random build a token
// node
// require('crypto).randomBytes(64).toString('hex)

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

// for jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {

        const serviceCollection = client.db('geniusCar').collection('services');
        const orderCollection = client.db('geniusCar').collection('orders'); // different collection create

        // jwt (client site theke pathabo tai post)
        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token }) // for token have to convert in json
            // console.log({token})
        })

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
        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body; //client site theke data pathale seta body er majhe thake
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        // client site a user ki ki order korse(user email er oper base kore) seta sei user dekhte chaile
        app.get('/orders', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('inside orders api', decoded);

            // email valid, token valid but data onno karo cheye thakleo no access
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }



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

        // update a specific property
        app.patch('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc);
            res.send(result);
        })


        // delete a service
        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
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