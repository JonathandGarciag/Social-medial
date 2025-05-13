import { response } from "express";
import { hash, verify } from "argon2";
import User from '../user/user.model.js';

export const getUser = async (req, res) => {
    try {
        const { limit = 10, desde = 0 } = req.query;
        const query = { status: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limit))
                .select('name username email role status createdAt updatedAt')
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
            error: e.message
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, password, oldPassword, role, ...data } = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, data, {
            new: true,
        }).select("name username email role status createdAt updatedAt");

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

        const user = await User.findById(id).select("+password");

        const validOldPassword = await verify(user.password, oldPassword);
        if (!validOldPassword) {
            return res.status(401).json({
                success: false,
                msg: "La contraseña anterior no es correcta"
            });
        }

        user.password = await hash(newPassword);
        await user.save();

        res.status(200).json({
            success: true,
            msg: "Contraseña actualizada correctamente",
        });

    } catch (error) {
        console.error("Error en updatePassword:", error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar la contraseña",
            error: error.message,
        });
    }
};
