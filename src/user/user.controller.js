import { response, request } from "express";
import { hash, verify  } from "argon2";
import User from '../user/user.model.js';
import jwt from "jsonwebtoken"

export const getUser = async (req, res) => {
    try {
        const token = req.header('x-token');
        
        if (!token) {
            return res.status(401).json({
                msg: 'No hay token en la petición',
            });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const authenticatedUser = await User.findById(uid);

        if (authenticatedUser.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                msg: 'No tiene permisos para realizar esta acción',
            });
        }

        const { limit = 10, desde = 0 } = req.query;
        const query = { status: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limit))
                .select('name username email password role status createdAt updatedAt')
        ]);

        res.status(200).json({
            success: true,
            total,
            users,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: 'Error al obtener usuarios',
            e
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, password, oldPassword, role, ...data } = req.body; 

        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "No hay token en la petición",
            });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        if (id !== uid) {
            return res.status(403).json({
                success: false,
                msg: "No tienes permisos para modificar este usuario",
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado",
            });
        }
        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true }).select("name username email role status createdAt updatedAt");

        res.status(200).json({
            success: true,
            msg: "Usuario actualizado correctamente",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error en updateUser:", error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar usuario",
            error: error.message,
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ success: false, msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        if (id !== uid) {
            return res.status(403).json({ success: false, msg: "No tienes permisos para cambiar la contraseña de este usuario" });
        }

        const user = await User.findById(id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, msg: "Usuario no encontrado" });
        }

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, msg: "Debes proporcionar la contraseña anterior y la nueva contraseña" });
        }

        const validOldPassword = await verify(user.password, oldPassword);

        if (!validOldPassword) {
            return res.status(401).json({ success: false, msg: "La contraseña anterior no es correcta" });
        }

        user.password = await hash(newPassword);

        await user.save();

        res.status(200).json({
            success: true,
            msg: "Contraseña actualizada correctamente",
        });
    } catch (error) {
        console.error("Error en updatePassword:", error);
        res.status(500).json({ success: false, msg: "Error al actualizar la contraseña", error: error.message });
    }
};
