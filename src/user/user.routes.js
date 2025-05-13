import { Router } from "express";
import { check } from "express-validator";
import { getUser, updateUser, updatePassword } from "./user.controller.js";
import { validarCampos } from "../middleware/validar-campos.js";
import { validarJWT } from "../middleware/validar-jwt.js";
import { existeUsuarioPorId, mismoUsuarioAutenticado } from "../helpers/db-validator.js";

const router = Router();

router.get(
    "/",
    [validarJWT, validarCampos],
    getUser
);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "ID no válido").isMongoId(),
        check("id").custom(existeUsuarioPorId),
        mismoUsuarioAutenticado,
        validarCampos
    ],
    updateUser
);

router.put(
    "/password/:id",
    [
        validarJWT,
        check("id", "ID no válido").isMongoId(),
        check("id").custom(existeUsuarioPorId),
        check("oldPassword", "La contraseña anterior es obligatoria").notEmpty(),
        check("newPassword", "La nueva contraseña es obligatoria").notEmpty(),
        mismoUsuarioAutenticado,
        validarCampos
    ],
    updatePassword
);

export default router;
