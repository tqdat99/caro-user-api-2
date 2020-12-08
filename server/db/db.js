const mongoose = require('mongoose');


// set up mongoose
const mongo_path = process.env.MONGO_PATH || "mongodb+srv://tqdat99:datdarkus1305@tqdat99.imlem.mongodb.net/caro?retryWrites=true&w=majority";
mongoose.connect(mongo_path, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Error connecting to database');
    });