import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import departmentRoutes from './routes/department.routes';
import employeeRoutes from './routes/employee.routes';
import assetRoutes from './routes/asset.routes';
import allocationRoutes from './routes/allocation.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import transferRoutes from './routes/transfer.routes';
import bookingRoutes from './routes/booking.routes';
import { verifyOrigin, allowedOrigins } from './middleware/csrf.middleware';

const app = express();
const port = process.env.PORT || 4000;

// Reflect back any origin on the allow-list (same list verifyOrigin uses)
// instead of a single static string — `cors` only ever sends one static
// Access-Control-Allow-Origin value per response, so hard-coding just the
// first ALLOWED_ORIGINS entry silently broke every other allowed origin
// in multi-origin deployments (verifyOrigin would accept the request, but
// the browser would then reject the response for a CORS mismatch).
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(verifyOrigin);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
