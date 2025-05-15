import { response } from "express";
import Comment from "./comment.model.js";
import Posteo from "../posteo/posteo.model.js";

export const createComment = async (req, res = response) => {
    try {
        const { content, post, parentComment, name } = req.body;

        const newComment = new Comment({
            post, 
            name,
            content,
            parentComment: parentComment || null,
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
      .populate({
        path: "parentComment",
        select: "content name",
      });

    const commentMap = {};
    comments.forEach(comment => {
      commentMap[comment._id] = {
        _id: comment._id,
        post: comment.post?.status ? comment.post.title : "Post eliminado",
        content: comment.status ? comment.content : "Comentario Eliminado",
        name: comment.name,
        parentComment: comment.parentComment
          ? {
              content: comment.parentComment.status
                ? comment.parentComment.content
                : "Comentario Eliminado",
              name: comment.parentComment.name,
            }
          : null,
        replies: [],
      };
    });

    const nestedComments = [];
    comments.forEach(comment => {
      if (comment.parentComment) {
        commentMap[comment.parentComment._id]?.replies.push(commentMap[comment._id]);
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
    });

    res.status(200).json({
      success: true,
      total: nestedComments.length,
      comments: nestedComments,
    });
  } catch (error) {
    console.error("Error en getComments:", error);
    res.status(500).json({ success: false, msg: "Error al obtener los comentarios" });
  }
};
