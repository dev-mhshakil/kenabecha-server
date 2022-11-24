const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express());

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
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => console.log(`server is running on ${port}`));
