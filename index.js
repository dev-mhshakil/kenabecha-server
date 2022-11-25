const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s7utf6p.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("kenabecha-app").collection("users");
    const mobilesCollection = client.db("kenabecha-app").collection("mobiles");
    const bookingsCollection = client
      .db("kenabecha-app")
      .collection("bookings");
    const categoriesCollection = client
      .db("kenabecha-app")
      .collection("categories");

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/dashboard/users/sellers", async (req, res) => {
      const query = { role: "Seller" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/dashboard/users/buyers", async (req, res) => {
      const query = { role: "Buyer" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const filter = { company };
      const result = await mobilesCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/categories/:name", async (req, res) => {
      const name = req.params.name;
      console.log(name);
      const filter = { company: name };
      console.log(filter);
      const result = await mobilesCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/mobiles", async (req, res) => {
      const query = {};
      const result = await mobilesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/mobile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await mobilesCollection.findOne(query);
      res.send(result);
    });

    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isRole: user?.role });
    });

    app.get("/myProducts/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { sellerEmail: email };
      const result = await mobilesCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/addProducts", async (req, res) => {
      const mobile = req.body;
      const result = await mobilesCollection.insertOne(mobile);
      res.send(result);
    });

    app.get("/addProducts", async (req, res) => {
      const name = { server: "connected" };
      res.send(name);
    });

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const booking = req.body;
      const filter = { _id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          booking,
          booked: true,
          id: id,
        },
      };
      const result = await bookingsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => console.log(`server is running on ${port}`));
