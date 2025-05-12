import { Router } from "express";
import { validarJWT } from "../middleware/validar-jwt.js"; 
import { validarAdminRole } from "../middleware/validar-roles.js";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../category/category.controller.js";

const router = Router();

router.get(
    "/", 
    getCategories
);


export default router;
