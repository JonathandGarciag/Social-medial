import { Router } from "express";
import { validarJWT } from "../middleware/validar-jwt.js"; 
import { validarAdminRole } from "../middleware/validar-roles.js";
import { getCategories, getCategoryById, getCategoriesFiltered } from "../category/category.controller.js";

const router = Router();

router.get(
    "/", 
    getCategories
);

router.get(
    "/search", 
    getCategoriesFiltered
);

router.get(
    "/:id",
    getCategoryById
);


export default router;
