const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
    MongoClient.connect(
        'mongodb+srv://admin:thaonhinheo0706@cluster0.5qg3p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    )
        .then((client) => {
            console.log('Connected!');
            callback(client);
        })
        .catch((err) => console.log(err));
};

module.exports = mongoConnect;
