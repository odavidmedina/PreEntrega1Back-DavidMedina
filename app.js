const express = require('express');
const app = express();
const port = 8080;

const productsRouter = require('./src/routes/products');
const cartsRouter = require('./src/routes/carts');

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
