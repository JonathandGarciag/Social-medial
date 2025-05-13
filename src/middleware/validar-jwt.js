import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';

export const validarJWT = async (req, res, next) => {
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
            success: false,
            msg: "No hay token en la petición",
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const user = await User.findById(uid);

        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "Usuario no existe en la base de datos",
            });
        }

        if (!user.status) {
            return res.status(401).json({
                success: false,
                msg: "Usuario no válido",
            });
        }

        req.user = user; 
        next();

    } catch (error) {
        console.error("Error en validarJWT:", error);
        return res.status(401).json({
            success: false,
            msg: "Token no válido",
        });
    }
};

export const validarJWTOpcional = async (req, res, next) => {
    const token = req.header("x-token");

    if (!token) {
        req.user = null;
        return next(); 
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const user = await User.findById(uid);

        if (!user || !user.status) {
            req.user = null;
        } else {
            req.user = user;
        }

        next();
    } catch (error) {
        console.warn("Token inválido:", error.message);
        req.user = null;
        next();
    }
};
