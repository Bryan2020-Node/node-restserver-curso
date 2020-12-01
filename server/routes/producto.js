const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();


let Producto = require('../models/producto');

app.get('/productos', (req, res) => {
    //tra todos los productos
    //populate: usuario categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        // .sort('')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }



            res.json({
                ok: true,
                items: productosDB.length,
                productos: productosDB
            })
        });

});



app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario categoria este metodo es totalmente funcional
    let id = req.params.id;
    // Producto.find({ '_id': id })
    //     .populate('usuario', 'nombre')
    //     .populate('categoria', 'descripcion')
    //     .exec((err, productosDB) => {
    //         if (err) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 err
    //             });
    //         }

    //         res.json({
    //             ok: true,
    //             items: productosDB.length,
    //             productos: productosDB
    //         })
    //     });

    Producto.findById(id)
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            //valida si existe el id en la bd
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                items: productoDB.length,
                productos: productoDB
            });
        });
});

//Buscar productos
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                items: productos.length,
                productos
            });
        });
});


app.post('/productos', verificaToken, (req, res) => {
    //grabar le usuario
    //grabar una categoria del listado

    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    //guardar en la bd
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });


});


app.put('/productos/:id', verificaToken, (req, res) => {
    //grabar le usuario
    //grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    let desProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion
    }

    Producto.findByIdAndUpdate(id, desProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //valida si existe el producto en la base de datos
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


app.delete('/productos/:id', (req, res) => {
    //cambiar el disponible

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        productoDB.disponible = false;
        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                prodcuto: productoBorrado,
                mensaje: 'Producto eliminado'
            });
        });
    });

    //otro metodo funcional
    // let desProducto = {
    //     disponible: false
    // }

    // Producto.findByIdAndUpdate(id, desProducto, { new: true }, (err, productoDB) => {
    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     //valida si existe el producto en la base de datos
    //     if (!productoDB) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'El producto no existe'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         producto: productoDB
    //     })
    // });

});









module.exports = app;