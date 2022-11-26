const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51M66MUG6ZZcJX2lVaINtf8DDgDo8oZeW0Zj3205xe6vre4XkinCQIwLclLGRFhdBi6qv72D0MbqJ1FyocQz9QENl00X3KP02Hp"
);

const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];
  // console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    // console.log(err);
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    // console.log(decoded.email);
    next();
  });
}

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
    const wishlistCollection = client
      .db("kenabecha-app")
      .collection("wishlists");
    const paymentsCollection = client
      .db("kenabecha-app")
      .collection("payments");

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACEESS_TOKEN_SECRET, {
          expiresIn: "7d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

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

    app.delete("/myProducts", async (req, res) => {
      const id = req.body.id;
      const query = { _id: ObjectId(id) };
      const result = await mobilesCollection.deleteOne(query);
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
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const booking = req.body;
      // const bookingEmail = req.body.buyerEmail;
      // console.log(bookingEmail);
      console.log(req.body);

      const filter = { _id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          booking,
          booked: true,
          id: id,
        },
      };
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { buyerEmail: email };
      const result = await bookingsCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/dashboard/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await mobilesCollection.findOne(query);
      const postResult = await wishlistCollection.insertOne(result);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const price = order.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      // console.log(paymentIntent.client_secret);
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // app.get("/payments", async(req, res) => {
    //   const query
    // })

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      console.log(payment);
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.orderId;
      const filter = { _id: ObjectId(id) };
      // console.log("id:", id);
      console.log(filter);
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updatedResult = await bookingsCollection.updateOne(
        filter,
        updatedDoc
      );
      console.log("updated result", updatedResult);
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
