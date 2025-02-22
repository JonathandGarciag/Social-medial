import { Router } from "express";
import { validarJWT } from "../middleware/validar-jwt.js";
import { createPost, getPosts, updatePost, deletePost } from "./posteo.controller.js";

const router = Router();

router.get(
    "/", 
    getPosts
);

router.post(
    "/", 
    [
    validarJWT
    ], 
    createPost

);

router.put(
    "/:id", 
    [
        validarJWT
    ],
    updatePost
);

router.delete(
    "/:id", 
    [
        validarJWT
    ], 
    deletePost
);


export default router;
