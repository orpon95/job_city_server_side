const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;



// middeleware
app.use(cors());
app.use(express.json());
console.log("password", process.env.DB_PASS);

// mongodb start



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ww7s5no.mongodb.net/?retryWrites=true&w=majority`;

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
        // database and collection create
        const database = client.db("jobDB");
        const jobscollection = database.collection("added-jobs");
        

        // [pst api for add product]

        app.post("/api/v1/addJobs", async (req, res) => {
            const addedjobs = req.body;
            const result = await jobscollection.insertOne(addedjobs)
            res.send(result)
            
            
        })

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





// mongodv end


// apis for server test
app.get("/", (req, res) => {
    res.send("job-city server is running")
})

app.listen(port, () => {
    console.log(`job-city server is running at port ${port}`)
})