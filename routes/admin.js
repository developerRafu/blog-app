const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Category")
const Category = mongoose.model('categories')
require("../models/Posts")
const Posts = mongoose.model('posts')
//const Posts =
//router.get('/', (req, res) => {
//    res.render('admin/index')
//})

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
    Category.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect('/admin/categories')
    }).catch((err) => {
        req.flash('error_msg', "Erro ao deletar categoria")
        res.redirect('/admin/categories')
    })
})
router.get('/posts', async (req, res) => {
    await Posts.find().populate("category").sort({ date: 'desc' }).then((posts) => {
        res.render('admin/posts', { postagens: posts })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens")
        res.redirect('/admin')
    })
})
router.get('/posts/add', (req, res) => {
    Category.find().then((categories) => {
        res.render('admin/addPosts', { categories })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar formulário")
        res.redirect('/admin')
    })
})
router.post('/posts/new', (req, res) => {
    var erros = [];
    if (req.body.category == "0") {
        erros.push({ texto: "Categoria inválida, registre uma categoria" })
    }
    if (erros.length > 0) {
        res.render("admin/addPosts", { erros: erros })
    } else {
        const newPost = {
            title: req.body.titulo,
            description: req.body.descricao,
            content: req.body.conteudo,
            category: req.body.category,
            slug: req.body.slug
        }
        new Posts(newPost).save().then(() => {
            req.flash("success_msg", "Postagem criada")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao postar")
            res.redirect("/admin/posts")
        })
    }
})

router.get('/posts/edit/:id', (req, res) => {
    Posts.findOne({ _id: req.params.id }).then((post) => {
        Category.find().then((categories) => {
            res.render('admin/editPosts', { categories, post })
        }).catch((err) => {
            req.flash("error_msg", "Houve erro ao listar categorias")
            res.redirect("/admin/posts")
        })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve erro ao carregar o formulário")
        res.redirect("/admin/posts")
    })
})

router.post("/posts/edit",(req,res)=>{
    Posts.findOne({_id: req.body.id}).then((post)=>{
        post.title = req.body.titulo,
        post.slug = req.body.slug,
        post.description = req.body.descricao,
        post.content = req.body.conteudo,
        post.category = req.body.category
        post.save().then(()=>{
            req.flash("success_msg", "Postagem editada")
            res.redirect("/admin/posts")
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg", "Etoo interno")
            res.redirect("/admin/posts")
        })
    }).catch((err)=>{
        req.flash("error_msg","Erro ao salvar")
        res.redirect("/admin/postagens")
    })
})

router.post("/posts/deletar",(req,res)=>{
    Posts.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect("/admin/posts")
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao deletar")
        res.redirect("/admin")
    })
})
module.exports = router