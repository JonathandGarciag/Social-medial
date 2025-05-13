import Role from "./role.model.js";

export const createDefaultRoles = async () => {
    const roles = ["ADMIN_ROLE", "USER_ROLE"];

    try {
        for (const roleName of roles) {
            const exists = await Role.findOne({ role: roleName });
            if (!exists) {
                const newRole = new Role({ role: roleName });
                await newRole.save();
                console.log(` -> Rol '${roleName}' creado correctamente.`);
            }
        }
    } catch (error) {
        console.error(" -> Error al crear roles por defecto:", error);
    }
};