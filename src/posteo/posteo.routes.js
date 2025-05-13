import { Router } from "express";
import { check, query } from "express-validator";
import { validarJWT } from "../middleware/validar-jwt.js";
import { createPost, getPostsFiltered, getPostById, deletePost } from "./posteo.controller.js";
import { existeCategoriaPorNombre, existePostById } from "../helpers/db-validator.js";
import { validarCampos } from "../middleware/validar-campos.js";

const router = Router();

router.get(
    "/",
    [
        query("category").optional().custom(existeCategoriaPorNombre),
        query("sort")
            .optional()
            .isIn(["fecha", "curso", "titulo", "popularidad"])
            .withMessage("Parámetro 'sort' inválido"),
        validarCampos
    ],
    getPostsFiltered
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
        validarJWT,
        check("title", "El título es obligatorio").notEmpty(),
        check("content", "El contenido es obligatorio").notEmpty(),
        check("category").custom(existeCategoriaPorNombre),
        validarCampos
    ],
    createPost
);

router.delete(
    "/:id", 
    [
        validarJWT,
        check("id").custom(existePostById),
    ], 
    deletePost
);


export default router;
