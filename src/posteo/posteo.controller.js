import { response } from "express";
import Posteo from "./posteo.model.js";
import Category from "../category/category.model.js";
import Comment from "../comment/comment.model.js"; 

export const createPost = async (req, res = response) => {
  try {
    const data = req.body;

    const processPost = async ({ title, content, author, category }) => {
      const cat = await Category.findOne({ category });
      if (!cat) throw new Error(`La categoría '${category}' no existe.`);

      const post = new Posteo({
        title,
        content,
        author,
        category: cat._id
      });

      return await post.save();
    };

    if (Array.isArray(data)) {
      const posts = await Promise.all(data.map(processPost));
      return res.status(201).json({ success: true, posts });
    }

    const post = await processPost(data);
    return res.status(201).json({ success: true, post });

  } catch (error) {
    console.error("Error en createPost:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al crear la publicación",
      error: error.message
    });
  }
};

export const getPostsFiltered = async (req, res = response) => {
  try {
    const { category, sort } = req.query;
    const filter = { status: true }; 

    if (category) {
      const catDoc = await Category.findOne({ category });
      if (catDoc) filter.category = catDoc._id;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "curso") sortOption = { category: 1 };
    else if (sort === "titulo") sortOption = { title: 1 };
    else if (sort === "popularidad") {
      const matchStage = { status: true, ...filter };

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
        { $sort: { totalComments: -1 } }
      ]);

      const populated = await Posteo.populate(posts, [
        { path: "category", select: "category" }
      ]);

      const result = populated.map(p => ({
        _id: p._id,
        title: p.title,
        category: p.category?.category || "Sin categoría",
        content: p.content,
        author: p.author,
        totalComments: p.totalComments,
        createdAt: p.createdAt
      }));

      return res.status(200).json({
        success: true,
        total: result.length,
        posts: result
      });
    }

    const posts = await Posteo.find(filter)
      .sort(sortOption)
      .populate("category", "category")
      .lean();

    const result = posts.map(p => ({
      _id: p._id,
      title: p.title,
      category: p.category?.category || "Sin categoría",
      content: p.content,
      author: p.author,
      createdAt: p.createdAt
    }));

    return res.status(200).json({
      success: true,
      total: result.length,
      posts: result
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

export const getPostsByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: "El parámetro 'title' es requerido." });
    }

    const posts = await Posteo.find({
      title: { $regex: title, $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error al buscar publicaciones por título:", error);
    res.status(500).json({ message: "Error interno del servidor" });
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

export const updatePost = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { title, content, author, category } = req.body;

    const cat = await Category.findOne({ category });
    if (!cat) {
      return res.status(400).json({ success: false, msg: `Categoría '${category}' no existe.` });
    }

    const updated = await Posteo.findByIdAndUpdate(
      id,
      {
        title,
        content,
        author,
        category: cat._id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, msg: "Publicación no encontrada" });
    }

    res.status(200).json({ success: true, post: updated });
  } catch (error) {
    console.error("Error en updatePost:", error);
    res.status(500).json({ success: false, msg: "Error al actualizar la publicación" });
  }
};

export const deletePost = async (req, res = response) => {
  try {
    const { id } = req.params;

    const post = await Posteo.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "Publicación no encontrada" });
    }

    await Posteo.findByIdAndUpdate(id, { status: false });

    res.status(200).json({
      success: true,
      msg: "Publicación deshabilitada correctamente."
    });

  } catch (error) {
    console.error("Error en deletePost:", error);
    res.status(500).json({ success: false, msg: "Error al deshabilitar la publicación" });
  }
};
