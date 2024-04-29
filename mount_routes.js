import usersRoutes from './routes/users_routes.js';
import authRoutes from './routes/auth_routes.js';

// mounts each individual router into the main application:
export const mountRoutes = (app) => {
    app.use('/api/users', usersRoutes); 
    app.use('/api/auth', authRoutes); 
}