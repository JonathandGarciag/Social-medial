
export const preventDefaultCategoryDeletion = async function (next) {
    const category = await this.model.findOne(this.getFilter());
    if (category && category.isDefault) {
        throw new Error("No se puede eliminar la categoría por defecto.");
    }
    next();
};
