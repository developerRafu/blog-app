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
    Category.find().sort({ date: "desc" }).then((categories) => {
        res.render('admin/categories', { categories: categories })
    }).catch((err) => {
        req.flash("error_msg", "Houve ao listar categorias")
        res.redirect("/admin")
    })
})
router.get('/categories/add', (req, res) => {
    res.render('admin/addcategory')
})
router.post('/categories/new', async (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' })
    }
    if (req.body.nome.length < 1) {
        erros.push({ texto: 'Nome muito pequeno' })
    }

    if (erros.length > 0) {
        res.render("admin/addcategory", { erros: erros })
    } else {
        const newCategory = {
            nome: await req.body.nome,
            slug: await req.body.slug
        }
        await new Category(newCategory).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categories')
        }).catch((err) => {
            req.flash("error_msg", "Houve erro ao salvar a categoria")
            res.redirect('/admin')
        })
    }
})

router.get('/categories/edit/:id', (req, res) => {
    Category.findOne({ _id: req.params.id }).then((category) => {
        res.render('admin/editCategories', { category: category })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect('admin/categories')
    })
})
router.post('/categories/edit', (req, res) => {
    Category.findOne({ _id: req.body.id }).then((category) => {
        category.nome = req.body.nome
        category.slug = req.body.slug
        category.save().then(() => {
            req.flash("success_msg", "Sucesso ao editar")
            res.redirect("/admin/categories")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar")
            res.redirect("/admin/categories")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a categoria")
        res.redirect('/admin/categories')
    })
})

router.post("/categories/deletar", (req, res) => {
    Category.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect('/admin/categories')
    }).catch((err) => {
        req.flash('error_msg', "Erro ao deletar categoria")
        res.redirect('/admin/categories')
    })
})
module.exports = router