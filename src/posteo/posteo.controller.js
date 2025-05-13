import { response } from "express";
import Posteo from "./posteo.model.js";
import Category from "../category/category.model.js";
import Comment from "../comment/comment.model.js"; 

export const createPost = async (req, res = response) => {
    try {
        const { title, content } = req.body;
        const { categoryId } = req;

        const newPost = new Posteo({
            title,
            category: categoryId,
            content,
            author: req.user._id,
        });

        await newPost.save();

        res.status(201).json({
            success: true,
            msg: "Publicación creada correctamente",
            post: newPost,
        });

    } catch (error) {
        console.error("Error en createPost:", error);
        res.status(500).json({ success: false, msg: "Error al crear la publicación" });
    }
};

export const getPostsFiltered = async (req, res = response) => {
    try {
        const { category, sort } = req.query;

        if (sort === "popularidad") {
            const matchStage = {};

            if (category) {
                const cat = await Category.findOne({ category });
                if (cat) matchStage.category = cat._id;
            }

            const posts = await Posteo.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "post",
                        as: "comments"
                    }
                },
                {
                    $addFields: {
                        totalComments: { $size: "$comments" }
                    }
                },
                {
                    $sort: { totalComments: -1 }
                }
            ]);

            const populatedPosts = await Posteo.populate(posts, [
                { path: "category", select: "category" },
                { path: "author", select: "name" }
            ]);

            const formattedPosts = populatedPosts.map(post => ({
                _id: post._id,
                title: post.title,
                category: post.category?.category || "Sin categoría",
                content: post.content,
                author: post.author?.name || "Anónimo",
                totalComments: post.totalComments || 0,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }));

            return res.status(200).json({
                success: true,
                total: formattedPosts.length,
                posts: formattedPosts
            });
        }

        const filter = {};
        if (category) {
            const cat = await Category.findOne({ category });
            if (cat) filter.category = cat._id;
        }

        let sortOption = { createdAt: -1 };
        if (sort === "curso") sortOption = { category: 1 };
        else if (sort === "titulo") sortOption = { title: 1 };

        const posts = await Posteo.find(filter)
            .sort(sortOption)
            .populate("category", "category")
            .populate("author", "name");

        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            category: post.category?.category,
            content: post.content,
            author: post.author?.name,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        res.status(200).json({
            success: true,
            total: formattedPosts.length,
            posts: formattedPosts
        });

    } catch (error) {
        console.error("Error en getPostsFiltered:", error);
        res.status(500).json({
            success: false,
            msg: "Error al obtener publicaciones",
            error: error.message
        });
    }
};


export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Posteo.findById(id)
            .populate("category", "category")
            .populate("author", "name");

        if (!post) {
            return res.status(404).json({ msg: "Publicación no encontrada" });
        }

        const comments = await Comment.find({ post: id })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            post,
            comments
        });

    } catch (error) {
        console.error("Error en getPostById:", error);
        res.status(500).json({ msg: "Error al obtener la publicación" });
    }
};

export const deletePost = async (req, res = response) => {
    try {
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
