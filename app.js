const express = require('express');
const mongoose = require('mongoose');
const auth = require('./middleware/auth');

const graphqlSchema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const graphqlHttp = require('express-graphql');

const app = express();
const port = 3000;

let connectDB = () => {
    if(process.env.MONGO_ONLINE == 'true')
        return `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mydb-x0kvb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
    return `mongodb://localhost:27017`    
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
});

app.use(auth);

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: resolvers,
    graphiql: true
}));

mongoose.connect(connectDB(),
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}
).then(() => {
    app.listen(port, (req, res) => {
        console.log(`Server started on port ${port}`);
    });
}).catch(err => {
    console.log(err);
})
