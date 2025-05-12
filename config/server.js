"use strict";

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import argon2 from "argon2";
import { dbConnection } from './mongo.js';
import limiter from '../src/middleware/validar-cant-peticiones.js'
import Category from '../src/category/category.model.js';
import User from '../src/user/user.model.js';
import authRoutes from '../src/auth/auth.routes.js'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from "../src/category/category.routes.js";
import postsRoutes from  '../src/posteo/posteo.routes.js'
import commentRoutes from  '../src/comment/comment.routes.js'

const middlewares = (app)=>{
    app.use(express.urlencoded({extended: false}))
    app.use(cors())
    app.use(express.json())
    app.use(helmet())
    app.use(morgan('dev'))
    app.use(limiter) 
}

const routes = (app) =>{
    app.use("/social-media/v3/auth", authRoutes);
    app.use("/social-media/v3/user", userRoutes);
    app.use("/social-media/v3/categories", categoryRoutes);
    app.use("/social-media/v3/posts", postsRoutes);
    app.use("/social-media/v3/comment", commentRoutes);
}

const conectarDB = async () =>{
    try {
        await dbConnection();
        console.log("Conexion a la base de datos exitosa");
    } catch (error) {
        console.error('Error conectado ala base de datos', error);
        process.exit(1);
    }
}

const createAdmin = async () => {
    try {
        const aEmail = "jgarciadmin@gmail.com";
        const aPassword = "12345678";

        const existingAdmin = await User.findOne({ email: aEmail });

        if (!existingAdmin) {
            const encryptedPassword = await argon2.hash(aPassword); 
            const aUser = new User({
                name: "Jonathan Gutierrez",
                username: "AdminJhonny",
                email: aEmail,
                password: encryptedPassword,
                role: "ADMIN_ROLE",
            });

            await aUser.save();
            console.log(" -> Usuario ADMIN creado correctamente.");
        }
    } catch (err) {
        console.error(" -> Error al crear el admin por defecto:", err);
    }
};

export const initServer = async () =>{
    const app = express();
    const port = process.env.PORT || 3000;

    try {
        middlewares(app);
        conectarDB();
        routes(app);
        await createDefaultCategory();  
        await createAdmin();  
        app.listen(port);
        console.log(`Server running on port ${port}`)
    } catch (err) {
        console.log(`Server init failed ${err}`);
    }
}

