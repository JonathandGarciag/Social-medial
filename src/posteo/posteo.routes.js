import { Router } from "express";
import { check, query } from "express-validator";
import { validarJWT } from "../middleware/validar-jwt.js";
import { createPost, getPostsFiltered, getPostById, deletePost, updatePost, getPostsByTitle } from "./posteo.controller.js";
import { existeCategoriaPorNombre, existePostById } from "../helpers/db-validator.js";
import { validarCampos } from "../middleware/validar-campos.js";

const router = Router();

router.get(
    "/",
    getPostsFiltered
);

router.get(
    "/search-by-title", 
    getPostsByTitle
);


router.get(
    "/:id", 
    [
        check("id").isMongoId(),
        check("id").custom(existePostById),
        validarCampos
    ],
    getPostById
);

router.post(
    "/",
    [
        check("title", "El título es obligatorio").notEmpty(),
        check("content", "El contenido es obligatorio").notEmpty(),
        check("category", "La categoría es obligatoria").notEmpty(),
        validarCampos
    ],
    createPost
);

router.delete(
    "/:id", 
    [
        check("id").custom(existePostById),
    ], 
    deletePost
);

router.put(
  "/:id",
  [
    check("id").isMongoId(),
    check("id").custom(existePostById),
    check("title", "El título es obligatorio").notEmpty(),
    check("content", "El contenido es obligatorio").notEmpty(),
    check("category", "La categoría es obligatoria").notEmpty(),
    validarCampos
  ],
  updatePost
);



export default router;
