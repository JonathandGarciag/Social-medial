import Role from '../role/role.model.js';
import User from '../user/user.model.js';
import Posteo from "../posteo/posteo.model.js";
import Comment from "../comment/comment.model.js";
import Category from '../category/category.model.js'

export const esRoleValido = async (role = '') =>{

    const existeRol = await Role.findOne({ role });

    if (!existeRol) {
        
        throw new Error(`El rol ${role} no existe en la base de datos`);
    }
}

export const existenteEmail = async (correo = '') =>{

    const existeEmail = await User.findOne({ correo });

    if (existeEmail) {
        throw new Error(`El correo ${correo} no existe en la base de datos`);
    }
} 

export const existePostPorTitulo = async (titulo = '') => {
    const post = await Posteo.findOne({ title: titulo });
    if (!post) {
        throw new Error(`El post con título '${titulo}' no existe`);
    }
};

export const existeComentarioPorId = async (id = '') => {
    if (!id) return; 
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new Error(`El comentario con ID '${id}' no existe`);
    }
};

export const existePostById = async (id = "") => {
    const existe = await Posteo.findById(id);
    if (!existe) {
        throw new Error(`No existe publicación con el ID: ${id}`);
    }
};

export const validarCategoriaPorNombre = async (categoryName = "", req) => {
    const categoria = await Category.findOne({ category: categoryName });
    if (!categoria) {
        throw new Error(`La categoría '${categoryName}' no existe`);
    }

    req.categoryId = categoria._id;
};

export const existeUsuarioPorId = async (id = '') => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error(`No existe usuario con el ID: ${id}`);
    }
};

export const mismoUsuarioAutenticado = (req, res, next) => {
    const uid = req.user?._id?.toString();
    const { id } = req.params;

    if (uid !== id) {
        return res.status(403).json({
            success: false,
            msg: "No tienes permisos para modificar este usuario",
        });
    }

    next();
};

export const existeCategoriaPorNombre = async (nombre = "") => {
    const existe = await Category.findOne({ category: nombre });
    if (!existe) {
        throw new Error(`La categoría '${nombre}' no existe`);
    }
};