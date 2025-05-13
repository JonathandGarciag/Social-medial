
export const validarAdminRole = (req, res, next) => {
    if (!req.user) {
        return res.status(500).json({
            msg: "Error interno: No se validó el token antes de verificar el rol",
        });
    }

    if (req.user.role !== "ADMIN_ROLE") {
        return res.status(403).json({
            msg: "No tienes permisos para realizar esta acción",
        });
    }

    next();
};
