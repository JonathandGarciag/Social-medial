import { response } from "express";
import { query } from "express-validator";
import Category from "./category.model.js";

export const createDefaultCategories = async () => {
    const categories = [
        { category: "Practica", description: "Categoría de práctica" },
        { category: "Taller", description: "Categoría de taller" },
        { category: "Tecnologia", description: "Categoría de tecnología" }
    ];

    try {
        for (const cat of categories) {
            const existingCategory = await Category.findOne({ category: cat.category });

            if (!existingCategory) {
                const newCategory = new Category(cat);
                await newCategory.save();
                console.log(` -> Categoría '${cat.category}' creada correctamente.`);
            } 
        }
    } catch (error) {
        console.error(" -> Error al crear las categorías por defecto:", error);
    }
};

export const getCategories = async (req, res) => {
    try {
        const query = { status: true };

        return res.status(200).json({
            success: true,
            total,
            categories
        });

    } catch (error) {
        console.error("Error en getCategories:", error);
        return res.status(500).json({
            success: false,
            msg: "Error al obtener categorías",
            error: error.message
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).select('category description status');

        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        console.error("Error en getCategoryById:", error);
        return res.status(500).json({
            success: false,
            msg: "Error al obtener la categoría",
            error: error.message
        });
    }
};

export const getCategoriesFiltered = async (req, res) => {
    try {
        const { category } = req.query;

        const query = {
            status: true,
            ...(category && { category: { $regex: category, $options: 'i' } }) 
        };

        const categories = await Category.find(query).select('category description status');

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        console.error("Error en getCategoriesFiltered:", error);
        return res.status(500).json({
            success: false,
            msg: "Error al filtrar categorías",
            error: error.message
        });
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
