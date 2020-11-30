// =========================================
// Puerto
// =========================================

process.env.PORT = process.env.PORT || 3000;


// =========================================
// Entorno
// =========================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =========================================
// Base de atos
// =========================================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://strider:xtU2ZuZnqRA8q0nq@cluster0.15wnd.mongodb.net/cafe';
}

process.env.URLDB = urlDB;