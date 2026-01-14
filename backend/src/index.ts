import cors from 'cors';
import express, { Request, Response } from 'express';
import { config } from './config/env';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import dashboardRoutes from './routes/dashboard';
import integrationRoutes from './routes/integrations';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Callback Route for Composio/OAuth
app.get('/api/callback', (req: Request, res: Response) => {
    // Attempt to redirect back to app using deep link
    // Scheme defined in app.json: "mymobileapp"
    const html = `
      <html>
        <body>
          <h1>Connection Successful!</h1>
          <p>You can close this window and return to the app.</p>
          <script>
            // Try to open the app
            setTimeout(function() {
                window.location.href = "mymobileapp://";
            }, 100);
          </script>
        </body>
      </html>
    `;
    res.send(html);
});

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'aariv-backend' 
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
