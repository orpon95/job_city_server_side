const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const allBiddedJobs = database.collection("All-bidded-jobs");



        // [pst api for add product]

        app.post("/api/v1/addJobs", async (req, res) => {
            const addedjobs = req.body;
            const result = await jobscollection.insertOne(addedjobs)
            res.send(result)


        })

        // get api to get addedjobs data

        app.get("/api/v1/getAddedJobsData", async (req, res) => {
            // console.log(req.query.email);
            // let query = {}
            // if(req?.query?.email){
            //     query = {categories: req?.query?.email}
            // }
            const cursor = jobscollection.find()
            const result = await cursor.toArray()
            res.send(result)

        })


        // post api for adding bidded jobs

        app.post("/api/v1/employ/allBiddedJobs", async (req, res) => {
            const BiddedJobs = req.body;
            const result = await allBiddedJobs.insertOne(BiddedJobs)
            res.send(result)


        })

        // get api to get all bidded data

        app.get("/api/v1/employ/getAllBiddedJobs", async (req, res) => {
            // console.log(req.query.email);
            // let query = {}
            // if(req?.query?.email){
            //     query = {categories: req?.query?.email}
            // }
            const cursor = allBiddedJobs.find()
            const result = await cursor.toArray()
            res.send(result)

        })

        // patch api2 to sent data to allbidded collection
        app.patch("/api/v2/employ/getAllBiddedJobs/:id", async (req, res) => {

            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            // const options = {upsert:true}
            const updatedData = req.body
            const setUpdatedData = {
                $set: {
                    complete_status: updatedData.status
                }
            }
            const result = await allBiddedJobs.updateOne(filter, setUpdatedData)
            res.send(result)
            // console.log(updatedData);
        })
        // patch api to sent data to allbidded collection
        app.patch("/api/v1/employ/getAllBiddedJobs/:id", async (req, res) => {

            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            // const options = {upsert:true}
            const updatedData = req.body
            const setUpdatedData = {
                $set: {
                    status: updatedData.status
                }
            }
            const result = await allBiddedJobs.updateOne(filter, setUpdatedData)
            res.send(result)
            // console.log(updatedData);
        })

        // put api to update alljobs data
        app.put("/api/v1/employ/allJobsUpdate/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedProduct = req.body
            console.log(id, updatedProduct);

            const setUpdatedProduct = {
                $set: {
                    email: updatedProduct?.email,
                    job_title: updatedProduct?.job_title,
                    deadline: updatedProduct?.deadline,
                    categories: updatedProduct?.categories,
                    min_price: updatedProduct?.min_price,
                    max_price: updatedProduct?.max_price,
                    short_description: updatedProduct?.short_description,

                }
            }
            const result = await jobscollection.updateOne(filter, setUpdatedProduct, options)
            res.send(result)
        })

        // delte api for delete card from posted job
        app.delete("/api/v1/employ/deleteJobsCard/:id", async (req, res) => {
            const id = req.params.id
            // console.log("pls delte ", id)
            const query = { _id: new  ObjectId(id) }
            const result = await jobscollection.deleteOne(query)
            res.send(result)
        })


        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        // Send a ping to confirm a successful connection
        client.db("admin").command({ ping: 1 });
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