import { response } from "express";
import Comment from "./comment.model.js";
import Posteo from "../posteo/posteo.model.js";
import jwt from "jsonwebtoken";

export const createComment = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const { post, content, parentComment } = req.body;

        const postFound = await Posteo.findOne({ title: post });
        if (!postFound) {
            return res.status(400).json({ msg: "El post ingresado no existe" });
        }

        if (parentComment) {
            const parentExists = await Comment.findById(parentComment);
            if (!parentExists) {
                return res.status(400).json({ msg: "El comentario al que intentas responder no existe" });
            }
        }

        const newComment = new Comment({
            post: postFound._id,
            author: uid,
            content,
            parentComment: parentComment || null 
        });

        await newComment.save();

        res.status(201).json({
            success: true,
            msg: "Comentario creado correctamente",
            comment: newComment,
        });
    } catch (error) {
        console.error("Error en createComment:", error);
        res.status(500).json({ success: false, msg: "Error al crear el comentario" });
    }
};

export const getComments = async (req, res = response) => {
    try {
        const comments = await Comment.find()
            .populate("post", "title status")
            .populate("author", "name")
            .populate({
                path: "parentComment",
                select: "content author",
                populate: { path: "author", select: "name" }
            });

        const commentMap = {};
        comments.forEach(comment => {
            commentMap[comment._id] = {
                _id: comment._id,
                post: comment.post.status ? comment.post.title : "Post eliminado",
                content: comment.status 
                    ? comment.content 
                    : "Comentario Eliminado", 
                author: comment.author.name,
                parentComment: comment.parentComment 
                    ? {
                        content: comment.parentComment.status 
                            ? comment.parentComment.content 
                            : "Comentario Eliminado", 
                        author: comment.parentComment.author.name
                    } 
                    : null,
                replies: [] 
            };
        });

        const nestedComments = [];
        comments.forEach(comment => {
            if (comment.parentComment) {
                commentMap[comment.parentComment._id].replies.push(commentMap[comment._id]);
            } else {
                nestedComments.push(commentMap[comment._id]);
            }
        });

        res.status(200).json({
            success: true,
            total: nestedComments.length,
            comments: nestedComments
        });

    } catch (error) {
        console.error("Error en getComments:", error);
        res.status(500).json({ success: false, msg: "Error al obtener los comentarios" });
    }
};



export const updateComment = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const { id } = req.params;
        const { content } = req.body;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        if (!comment.status) {
            return res.status(400).json({ msg: "No puedes editar un comentario deshabilitado" });
        }

        if (comment.author.toString() !== uid) {
            return res.status(403).json({ msg: "No tienes permiso para editar este comentario" });
        }

        comment.content = content;
        comment.updatedAt = new Date();
        await comment.save();

        res.status(200).json({
            success: true,
            msg: "Comentario actualizado correctamente",
            comment,
        });

    } catch (error) {
        console.error("Error en updateComment:", error);
        res.status(500).json({ success: false, msg: "Error al actualizar el comentario" });
    }
};


export const deleteComment = async (req, res = response) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const { id } = req.params;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        if (!comment.status) {
            return res.status(400).json({ msg: "El comentario ya está deshabilitado" });
        }

        if (comment.author.toString() !== uid) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar este comentario" });
        }

        await Comment.findByIdAndUpdate(id, { status: false, updatedAt: new Date() });

        res.status(200).json({
            success: true,
            msg: "Comentario deshabilitado correctamente",
        });

    } catch (error) {
        console.error("Error en deleteComment:", error);
        res.status(500).json({ success: false, msg: "Error al deshabilitar el comentario" });
    }
};
