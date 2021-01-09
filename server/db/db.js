const mongoose = require('mongoose');


// set up mongoose
const mongo_path = process.env.MONGO_PATH;
mongoose.connect(mongo_path, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Error connecting to database');
    });
