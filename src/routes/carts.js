const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');


const getCarts = async () => JSON.parse(await fs.readFile(cartsFilePath, 'utf8'));
const saveCarts = async (carts) => await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
const getProducts = async () => JSON.parse(await fs.readFile(productsFilePath, 'utf8'));


const generateId = (items) => {
    const ids = items.map(item => item.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
};


router.post('/', async (req, res) => {
    const carts = await getCarts();
    const newCart = {
        id: generateId(carts),
        products: []
    };

    carts.push(newCart);
    await saveCarts(carts);
    res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const carts = await getCarts();
    const cart = carts.find(c => c.id == cid);

    if (cart) {
        res.json(cart);
    } else {
        res.status(404).json({ error: 'Cart not found' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const carts = await getCarts();
    const products = await getProducts();
    const cart = carts.find(c => c.id == cid);
    const product = products.find(p => p.id == pid);

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const cartProduct = cart.products.find(p => p.product == pid);

    if (cartProduct) {
        cartProduct.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    await saveCarts(carts);
    res.json(cart);
});

module.exports = router;
