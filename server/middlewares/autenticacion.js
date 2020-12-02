const jwt = require('jsonwebtoken');
//===============================
// Verificar Token
//===============================


let verificaToken = (req, res, next) => {

    let token = req.get('token'); // nombre en la peticion de los headers

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;
        //permite continuar con el proceso de la aplicacion
        next();
    });

};


//===============================
// Verificar admin ROle
//===============================

let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El usuario no es un administrador'
            }
        });
    }
}

//===============================
// Verificar Token IMG
//===============================
let verrificaTokenImg = (req, res, next) => {
    //manda el token por la url y no en los headers
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;
        //permite continuar con el proceso de la aplicacion
        next();
    });
}




module.exports = {
    verificaToken,
    verificaAdminRole,
    verrificaTokenImg
}