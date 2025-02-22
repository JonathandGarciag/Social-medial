import { Router } from "express";
import { validarJWT } from "../middleware/validar-jwt.js";
import { createComment, getComments, updateComment, deleteComment } from "./comment.controller.js";

const router = Router();

router.post(
    "/", 
    validarJWT, 
    createComment
);

router.get(
    "/", 
    getComments
);

router.put(
    "/:id", 
    validarJWT, 
    updateComment
);

router.delete(
    "/:id", 
    validarJWT, 
    deleteComment
);

export default router;
