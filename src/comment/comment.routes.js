import { Router } from "express";
import { check } from "express-validator";
import { createComment, getComments } from "./comment.controller.js";
import { existeComentarioPorId, existePostById } from "../helpers/db-validator.js";
import { validarCampos } from "../middleware/validar-campos.js";

const router = Router();

router.post(
    "/",
    [
        check("post", "El ID del post es obligatorio").isMongoId(),
        check("post").custom(existePostById),
        check("content", "El contenido no puede estar vacío").notEmpty(),
        check("parentComment").optional().custom(existeComentarioPorId),
        validarCampos
    ],
    createComment
);

router.get("/", getComments);
export default router;
