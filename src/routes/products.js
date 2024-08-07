const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const productsFilePath = path.join(__dirname, '../data/products.json');


const getProducts = async () => JSON.parse(await fs.readFile(productsFilePath, 'utf8'));
const saveProducts = async (products) => await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));


const generateId = (products) => {
    const ids = products.map(product => product.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
};


router.get('/', async (req, res) => {
    const { limit } = req.query;
    let products = await getProducts();
    if (limit) {
        products = products.slice(0, parseInt(limit));
    }
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const products = await getProducts();
    const product = products.find(p => p.id == req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const products = await getProducts();
    const newProduct = {
        id: generateId(products),
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    await saveProducts(products);
    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id == pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
        ...products[productIndex],
        ...req.body
    };

    products[productIndex] = updatedProduct;
    await saveProducts(products);
    res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const products = await getProducts();
    const newProducts = products.filter(p => p.id != pid);

    if (products.length === newProducts.length) {
        return res.status(404).json({ error: 'Product not found' });
    }

    await saveProducts(newProducts);
    res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
