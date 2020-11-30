const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');
const app = express();


app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        //busca si la contraseña ingresada hace match con la contraseña de la base de datos devolviendo un true/false
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            })
        }

        //genera un token o refresca el token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        //expiresIn: 60 * 60 * 24(horas) * 30(dias)

        res.json({
            ok: true,
            usuaro: usuarioDB,
            token
        });

    });
});

//Configuraciones de Google
//verifica si el token de google es valido regresando una promesa
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    //llama la funcion que valida el token de google
    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: e
            });
        });

    //busca si el usuario de base de datos existe
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        //verifica si el usuario ya se ha registrado con autenticacion normal
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                res.status(400).json({
                    ok: false,
                    err: {
                        messaje: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                //renueva un token o refresca el token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usaurio: usuarioDB,
                    token,
                });
            }
        } else {
            //Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'

            usuario.save((err, usuarioDB) => {

                //si ocurre un error en la insercion
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usaurio: usuarioDB,
                    token,
                });
            });
        }
    });

    // res.json({
    //     usuario: googleUser
    // })
});







module.exports = app;