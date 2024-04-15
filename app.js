const express = require("express");
const app = express();
const connectToDatabase = require("./db");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

// Initialize Passport middleware
app.use(passport.initialize());
 app.use(passport.session()); 

// Connect to the database
connectToDatabase();

// Create a new MongoDBStore
const store = new MongoDBStore({
    uri: "mongodb://localhost:27017/TaskMaster",
    secret: "my-secret",
    collection: "sessions"
});

// Handle session middleware
app.use(session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    store: store
}));

// Import user routes
const userRoutes = require("./routes/User");

// Parse incoming request bodies
app.use(bodyParser.json());

// Use user routes
app.use(userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
