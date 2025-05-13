import { response } from "express";
import Comment from "./comment.model.js";
import Posteo from "../posteo/posteo.model.js";

export const createComment = async (req, res = response) => {
    try {
        const { content, post, parentComment } = req.body;
        const name = req.user?.username || "Unidentified_User";
        const userId = req.user?._id;

        const postFound = await Posteo.findOne({ title: post }).populate("author");

        const newComment = new Comment({
            post: postFound._id,
            name,
            content,
            parentComment: parentComment || null,
        });

        await newComment.save();

        if (userId) {
            if (parentComment) {
                const parent = await Comment.findById(parentComment);
                const authorUser = await User.findOne({ username: parent.name });

                if (authorUser && authorUser._id.toString() !== userId.toString()) {
                    await Notification.create({
                        user: authorUser._id,
                        type: "comment_reply",
                        referenceId: parent._id
                    });
                }
            } else {
                if (postFound.author && postFound.author._id.toString() !== userId.toString()) {
                    await Notification.create({
                        user: postFound.author._id,
                        type: "post_reply",
                        referenceId: postFound._id
                    });
                }
            }
        }

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