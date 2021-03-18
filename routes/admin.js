const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Category")
const Category = mongoose.model('categories')
router.get('/', (req, res) => {
    res.render('admin/index')
})
router.get('/posts', (req, res) => {
    res.send('Posts')
})
router.get('/categories', (req, res) => {
    res.render('admin/categories')
})
router.get('/categories/add', (req, res) => {
    res.render('admin/addcategory')
})
router.post('/categories/new', async (req, res) => {
    console.log('Corpo', req.body)
    const newCategory = {
        nome: await req.body.nome,
        slug: await req.body.slug
    }
    await new Category(newCategory).save().then(() => {
        console.log('Salvo')
    }).catch((err) => {
        console.log('Error: ', err)
    })
})
module.exports = router