const express = require('express');
const Categoria = require('../models/categoria');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
// const categoria = require('../models/categoria');

let app = express();



//==============================
//Mostar todas las categorias
//==============================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        //order by
        .sort('descripcion')
        //similar a join
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    items: conteo,
                    // itemss: categorias.length,
                    categorias
                });
            });

        });
});

//==============================
//Mostrar una categoria por ID
//==============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    //este metodo unicamente busca los resultados por su id por lo que puede devolver solo 1 resultado
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //si el id no existe
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            // items: categoriaDB.leng,
            categoria: categoriaDB
        });
    });

    //otra forma donde filtra los resultados por cualquier cosa
    // let id = req.params.id;
    // Categoria.find({ '_id': id })
    //     .exec((err, categorias) => {
    //         if (err) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 err
    //             });
    //         }

    //         Categoria.count({ '_id': id }, (err, conteo) => {
    //             res.json({
    //                 ok: true,
    //                 items: conteo,
    //                 // itemss: categorias.length,
    //                 categorias
    //             });
    //         });

    //     });
});

//==============================
//Crear Nueva Categoria
//==============================
app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoria
    //req.usuario._id
    let body = req.body;


    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        //muestra el error si existe
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //valida si ya esxite esa categoria en la base de datos
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

//==============================
//Actualiza la Categoria
//==============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    //actualiza la categoria
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        //muestra el error si existe
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //valida si ya esxite esa categoria en la base de datos
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


//==============================
//Elimina Categoria
//==============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    //Solo un admin puede borrar la categoria
    let id = req.params.id;


    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        //muestra el error si existe
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //valida si ya esxite esa categoria en la base de datos
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    });
});




module.exports = app;