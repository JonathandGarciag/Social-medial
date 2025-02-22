import { response } from "express";
import Posteo from "./posteo.model.js";
import Category from "../category/category.model.js";
import jwt from "jsonwebtoken";

export const createPost = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const { title, category, content } = req.body;  

        const categoryFound = await Category.findOne({ name: category });
        if (!categoryFound) {
            return res.status(400).json({ msg: "La categoría ingresada no existe" });
        }

        const newPost = new Posteo({
            title,
            category: categoryFound._id,  
            content,
            author: uid
        });

        await newPost.save();

        res.status(201).json({
            success: true,
            msg: "Publicación creada correctamente",
            post: newPost
        });

    } catch (error) {
        console.error("Error en createPost:", error);
        res.status(500).json({ success: false, msg: "Error al crear la publicación" });
    }
};

export const getPosts = async (req, res = response) => {
    try {
        const posts = await Posteo.find()
            .populate("category", "name") 
            .populate("author", "name"); 

        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            category: post.category.name, 
            content: post.content,
            author: post.author.name,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        res.status(200).json({
            success: true,
            total: formattedPosts.length,
            posts: formattedPosts
        });

    } catch (error) {
        console.error("Error en getPosts:", error);
        res.status(500).json({ success: false, msg: "Error al obtener publicaciones" });
    }
};


export const updatePost = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const { id } = req.params;
        const { title, category, content } = req.body;

        const post = await Posteo.findById(id);
        if (!post) {
            return res.status(404).json({ msg: "Publicación no encontrada" });
        }

        if (post.author.toString() !== uid) {
            return res.status(403).json({ msg: "No tienes permiso para editar esta publicación" });
        }

        let categoryToUpdate = post.category;

        if (category) {
            const categoryFound = await Category.findOne({ name: category });
            if (!categoryFound) {
                return res.status(400).json({ msg: "La categoría seleccionada no existe" });
            }
            categoryToUpdate = categoryFound._id;
        }

        const updatedPost = await Posteo.findByIdAndUpdate(
            id,
            { title, category: categoryToUpdate, content },
            { new: true }
        ).populate("category", "name") 
         .populate("author", "name");

        res.status(200).json({
            success: true,
            msg: "Publicación actualizada correctamente",
            post: {
                _id: updatedPost._id,
                title: updatedPost.title,
                category: updatedPost.category.name,
                content: updatedPost.content,
                author: updatedPost.author.name,
                createdAt: updatedPost.createdAt,
                updatedAt: updatedPost.updatedAt
            }
        });

    } catch (error) {
        console.error("Error en updatePost:", error);
        res.status(500).json({ success: false, msg: "Error al actualizar la publicación" });
    }
};

export const deletePost = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const { id } = req.params;

        const post = await Posteo.findById(id);
        if (!post) {
            return res.status(404).json({ msg: "Publicación no encontrada" });
        }

        if (post.author.toString() !== uid) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar esta publicación" });
        }

        await Posteo.findByIdAndUpdate(id, { status: false });

        res.status(200).json({
            success: true,
            msg: "Publicación deshabilitada correctamente, los comentarios permanecen."
        });

    } catch (error) {
        console.error("Error en deletePost:", error);
        res.status(500).json({ success: false, msg: "Error al deshabilitar la publicación" });
    }
};
