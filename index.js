const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ynccjdb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db("toyTrackers").collection("toys");
    const blogCollection = client.db("toyTrackers").collection("toyBlogs");


     // toy get api
     app.get('/toys', async(req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    // toy get api with specific id 
    app.get('/toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await toyCollection.findOne(query);
      res.send(result);
    })


      // toy get api sum data with user email
      app.get('/mytoys', async(req, res) =>{
        let query = {}
        if(req.query?.email){
          query = {email: req.query.email}
        }
        const cursor = toyCollection.find(query)
        const result = await cursor.toArray();
        res.send(result)
      })

     //toy post api 
     app.post('/toys', async(req, res) => {
      const toy = req.body;
      // console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    })


       // toy put api (updated)
       app.put('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const toy = req.body;
        // console.log(id, toy);
        const filter = {_id: new ObjectId(id)};
        const options = { upsert: true };
        const updatedToy = {
          $set: {
            price: toy.price,
            quantity: toy.quantity,
            details: toy.details
          }
        }
        const result = await toyCollection.updateOne(filter, updatedToy, options);
        res.send(result);
      })

     // toy delete api 
     app.delete('/toys/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })


     // toy blog get api
     app.get('/blogs', async(req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Toy Trackers server is running!");
})

app.listen(port, () => {
    console.log(`Toy trackers server is running on port: ${port}`);
})