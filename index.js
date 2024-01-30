const express = require("express");
const cors = require("cors");
require('dotenv').config()
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken")
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;



// middeleware
app.use(cors({
    origin: [

        "http://localhost:5173",
        "https://job-city-b516d.web.app",
        "job-city-b516d.firebaseapp.com",
        "https://job-city-b516d.firebaseapp.com",
        "https://654ccfa2ddff4238596ed626--gorgeous-blini-aab416.netlify.app",
        "https://job-city.netlify.app"
    ]
    ,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())


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

// middelewares
const veryfyToken = async (req, res, next) => {
    const token = req?.cookies?.token
    // console.log("middeler",token);
    if (!token) {
        return res.status(401).send({ message: "not authorised user" })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "unauthorized user" })
        }
        // console.log("real decoded toke", decoded);
        req.user = decoded
        next()
    })

}

async function run() {
    try {
        // database and collection create
        const database = client.db("jobDB");
        const jobscollection = database.collection("added-jobs");
        const allBiddedJobs = database.collection("All-bidded-jobs");


        // token api
        app.post("/api/v1/jwt", async (req, res) => {
            const user = req.body;
            console.log(user);
            // const result = await jobscollection.insertOne(addedjobs)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

            res.cookie("token", token, {
                httpOnly: true,
                // secure: true,
                // sameSite: "none",
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                // maxAge: 60 * 60 * 1000


            })

                .send({ success: true })


        })
        // logout api
        app.post("/api/v1/jwt/logout", async (req, res) => {
            const user = req.body;
            console.log("logoyt", user);
            // const result = await jobscollection.insertOne(addedjobs)


            res.clearCookie("token", {
                maxAge: 0,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",


            })

                .send({ success: true })


        })


        //    services api

        // [pst api for add product]

        app.post("/api/v1/addJobs", async (req, res) => {
            const addedjobs = req.body;
            const result = await jobscollection.insertOne(addedjobs)
            res.send(result)


        })

        // get api to get addedjobs to home page 

        app.get("/api/v2/getAddedJobsData", async (req, res) => {
            // console.log(req.query.email);
            let query = {}
            if (req?.query?.email) {
                query = { email: req?.query?.email }
            }
            // console.log("tok tok",req.cookies.token);
            const cursor = jobscollection.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })

        // get api to get addedjobs to postedjob route data
        //veryfyToken,

        app.get("/api/v1/getAddedJobsData", veryfyToken, async (req, res) => {
            console.log("query email", req.query.email);
            console.log("token query", req?.user?.email);
            // if(req?.query?.email !== req?.user?.email){
            //     return res.status(401).send({message:"forbidden access"})
            // }
            let query = {}
            if (req?.query?.email) {
                query = { email: req?.query?.email }
            }
            console.log("tok tok user", req.user);
            const cursor = jobscollection.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })


        // post api for adding bidded jobs

        app.post("/api/v1/employ/allBiddedJobs", async (req, res) => {
            const BiddedJobs = req.body;
            const result = await allBiddedJobs.insertOne(BiddedJobs)
            res.send(result)


        })

        // get api to get all bidded data by query this
        //veryfyToken,

        app.get("/api/v1/employ/getAllBiddedJobs", veryfyToken, async (req, res) => {
            console.log("bijidde email", req.query?.email);
            let query = {}
            if (req?.query?.email) {
                query = { bidder_email: req?.query?.email }
            }
            const cursor = allBiddedJobs.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })
        // get api to get all bidded data by all this2
        //veryfyToken,

        app.get("/api/v3/employ/getAllBiddedJobs", veryfyToken, async (req, res) => {
            console.log("bijidde email", req.query?.email);
            let query = {}
            if (req?.query?.email) {
                query = { Buyer_email: req?.query?.email }
            }
            const cursor = allBiddedJobs.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })
        // get api to get all bidded data for bidder email and buyer email get

        app.get("/api/v4/employ/getAlladdedJobs", async (req, res) => {
            console.log("bijidde email", req.query?.email);
            // let query = {}
            // if(req?.query?.email){
            //     query = {bidder_email: req?.query?.email}
            // }
            const projection = {
                email: 1,



            }
            const cursor = jobscollection.find().project(projection)
            const result = await cursor.toArray()
            res.send(result)

        })

        // get api for all bidded jobs 

        app.get("/api/v6/employ/getAllBiddedJobs", async (req, res) => {
           
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
            const query = { _id: new ObjectId(id) }
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