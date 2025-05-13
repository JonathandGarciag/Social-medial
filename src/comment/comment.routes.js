import { Router } from "express";
import { check } from "express-validator";
import { validarJWTOpcional } from "../middleware/validar-jwt.js";
import { createComment, getComments } from "./comment.controller.js";
import { existeComentarioPorId, existePostPorTitulo } from "../helpers/db-validator.js";
import { validarCampos } from "../middleware/validar-campos.js";

const router = Router();

router.post(
    "/",
    [
        check("post", "El título del post es obligatorio").notEmpty(),
        check("post").custom(existePostPorTitulo),
        check("content", "El contenido no puede estar vacío").notEmpty(),
        check("parentComment").optional().custom(existeComentarioPorId),
        validarJWTOpcional,
        validarCampos
    ],
    createComment
);

router.get(
    "/", 
    getComments
);

export default router;
