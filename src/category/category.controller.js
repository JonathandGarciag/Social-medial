import { response } from "express";
import Category from "./category.model.js";
import Posteo from "../posteo/posteo.model.js"; 
import jwt from "jsonwebtoken";

export const createCategory = async (req, res = response) => {
    try {
        if (!req.user || req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No tienes permisos para realizar esta acción",
            });
        }

        const { name, description } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({
                success: false,
                msg: "La categoría ya existe",
            });
        }

        const category = new Category({ name, description });
        await category.save();

        res.status(201).json({
            success: true,
            msg: "Categoría creada correctamente",
            category,
        });
    } catch (error) {
        console.error("Error en createCategory:", error);
        res.status(500).json({
            success: false,
            msg: "Error al crear categoría",
        });
    }
};

export const getCategories = async (req, res = response) => {
    try {
        const categories = await Category.find({ status: true });

        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error("Error en getCategories:", error);
        res.status(500).json({ success: false, msg: "Error al obtener categorías" });
    }
};


export const updateCategory = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        if (!req.user || req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tienes permisos para realizar esta acción" });
        }

        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });

        if (!category) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        await Posteo.updateMany(
            { category: id }, 
            { categoryName: name, categoryDescription: description } 
        );

        res.status(200).json({
            success: true,
            msg: "Categoría actualizada correctamente en toda la base de datos",
            category,
        });

    } catch (error) {
        console.error("Error en updateCategory:", error);
        res.status(500).json({ success: false, msg: "Error al actualizar categoría" });
    }
};


export const deleteCategory = async (req, res = response) => {
    try {
        const token = req.header("x-token");

        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        if (!req.user || req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tienes permisos para realizar esta acción" });
        }

        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        if (category.isDefault) {
            return res.status(400).json({
                success: false,
                msg: "No puedes deshabilitar la categoría por defecto",
            });
        }

        const defaultCategory = await Category.findOne({ isDefault: true });
        if (!defaultCategory) {
            return res.status(500).json({ msg: "No se encontró la categoría por defecto" });
        }

        await Posteo.updateMany(
            { category: id },
            { category: defaultCategory._id, categoryName: defaultCategory.name }
        );

        await Category.findByIdAndUpdate(id, { status: false });

        res.status(200).json({
            success: true,
            msg: "Categoría deshabilitada correctamente y publicaciones reasignadas a la categoría 'General'.",
        });

    } catch (error) {
        console.error("Error en deleteCategory:", error);
        res.status(500).json({ success: false, msg: "Error al deshabilitar categoría" });
    }
};
