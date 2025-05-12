import { response } from "express";
import Category from "./category.model.js";
import Posteo from "../posteo/posteo.model.js"; 

const createDefaultCategory = async () => {
    try {
        const existingCategory = await Category.findOne({ name: "General" });

        if (!existingCategory) {
            const defaultCategory = new Category({
                name: "General",
                description: "Categoría predeterminada",
                isDefault: true
            });

            await defaultCategory.save();
            console.log(" -> Categoría por defecto creada correctamente.");
        }
    } catch (error) {
        console.error(" -> Error al crear la categoría por defecto:", error);
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
