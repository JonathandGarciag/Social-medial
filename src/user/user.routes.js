import { Router } from "express";
import { check } from "express-validator";
import { getUser, updateUser, updatePassword } from "../user/user.controller.js";

const router = Router();
 
router.get(
    "/", 
    getUser
);

router.put(
    "/:id", 
    updateUser
);

router.put(
    "/password/:id", 
    updatePassword
);

export default router;