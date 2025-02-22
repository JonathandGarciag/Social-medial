import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { 
        msg: "⚠️ Has superado el límite de solicitudes. Intenta más tarde." 
    }
});

export default limiter;
