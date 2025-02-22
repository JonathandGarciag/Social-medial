import { Router } from "express";
import { validarJWT } from "../middleware/validar-jwt.js"; 
import { validarAdminRole } from "../middleware/validar-roles.js";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../category/category.controller.js";

const router = Router();

router.get(
    "/", 
    getCategories
);

router.post(
    "/", 
    [
        validarJWT, 
        validarAdminRole
    ], 
    createCategory
);

router.put(
    "/:id", 
    [
        validarJWT, 
        validarAdminRole
    ], 
    updateCategory
);

router.delete(
    "/:id", 
    [
        validarJWT, 
        validarAdminRole
    ], 
    deleteCategory
);

export default router;
