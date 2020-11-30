const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion'); //destructuracion

const app = express();


app.get('/usuario', verificaToken, (req, res) => {

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    //filtra la busqueda con parametros
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ 'estado': true }, 'nombre email rool estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //de esta forma obtenemos el conteo de registros respetando la misma sintaxis del filtro
            // Usuario.count({})
            //     .skip(desde)
            //     .limit(limite)
            //     .exec((err, conteo) => {
            //         res.json({
            //             ok: true,
            //             conteo,
            //             usuarios
            //         });
            //     });


            Usuario.count({ 'estado': true }, (err, conteo) => {
                res.json({
                    ok: true,
                    conteo,
                    usuarios
                });
            });
        });
});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {
    let body = req.body;

    //instancia del esquema y asignamos valores a los objetos del modelo
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //guarda el dato en la base de datos
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            //objetos y propiedades
            ok: true,
            usuario: usuarioDB
        })
    });

});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    //valida los campos que pueden ser modificados
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    // Usuario.findByIdAndUpdate(id, (err, usuarioBorrado) => {
    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;