# Credion Website

A modern, responsive website for Credion - Australia's leading Financial Intelligence Bureau with full authentication and payment management system.

## Features

- **ProbR™ Score Technology**: Dynamic 0-1000 risk scoring
- **Real-time Monitoring**: Continuous client risk assessment
- **Multi-industry Support**: Serving 19+ industry sectors
- **User Authentication**: Complete login/signup system
- **Payment Management**: Stripe integration for payment methods
- **Live Database**: PostgreSQL with AWS RDS integration
- **Responsive Design**: Optimized for all devices
- **Government Solutions**: Specialized intelligence services

## Tech Stack

### Frontend
- **React** + **TypeScript**
- **Tailwind CSS** for styling
- **Vite** for build tool
- **React Router DOM** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** + **Express**
- **PostgreSQL** database with **Sequelize ORM**
- **JWT** authentication
- **Stripe** payment integration
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** database access
- **Stripe** account (for payment processing)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/flexcollect-dataset/Credion.git
cd Credion
```

### 2. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `backend` directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=15432
   DB_NAME=FlexDataseterMaster
   DB_USER=FlexUser
   DB_PASSWORD=your_password_here
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   
   # Stripe Configuration
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   
   # Server Configuration
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm start
   # or for development
   node app.js
   ```

   The backend will run on `http://localhost:3001`

### 3. Frontend Setup

1. **Navigate to root directory** (if not already there)
   ```bash
   cd ..  # Go back to root directory
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or next available port)

### 4. Database Connection (Optional - for live database)

If you want to connect to the live AWS RDS database:

1. **Set up SSH tunnel** (if using connection.pem file):
   ```bash
   ssh -i "path/to/connection.pem" -L 15432:flexdataset.cluster-cpoeqq6cwu00.ap-southeast-2.rds.amazonaws.com:5432 -N ec2-user@3.25.151.77 &
   ```

2. **Update .env file** with correct database credentials

## Running the Application

### Development Mode

1. **Terminal 1 - Start Backend:**
   ```bash
   cd backend
   node app.js
   ```

2. **Terminal 2 - Start Frontend:**
   ```bash
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts
```bash
node app.js          # Start backend server
npm start            # Start backend server (if configured)
```

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Payment Methods
- `GET /payment-methods?userId={id}` - Get user payment methods
- `POST /payment-methods` - Add new payment method
- `PUT /payment-methods/:id/set-default` - Set default payment method
- `DELETE /payment-methods/:id` - Delete payment method

## Project Structure

```
├── src/                     # Frontend source code
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   └── main.tsx           # Application entry point
├── backend/                # Backend source code
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/          # Express middleware
│   ├── config/             # Database configuration
│   └── app.js             # Main server file
├── public/                 # Static assets
└── package.json           # Frontend dependencies
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify SSH tunnel is active (if using remote database)

2. **CORS Errors**
   - Update `CORS_ORIGIN` in backend `.env` to match frontend URL
   - Ensure backend is running on correct port

3. **Stripe Errors**
   - Verify Stripe API keys are correct
   - Ensure you're using test keys for development

4. **Port Already in Use**
   - Change ports in configuration files
   - Kill existing processes using the ports

### Development Tips

- Use browser developer tools to debug frontend issues
- Check backend console logs for API errors
- Use Postman or similar tools to test API endpoints
- Monitor network requests in browser dev tools

## Production Deployment

### Frontend (Netlify)
- Automatic deployment on git push
- Environment variables configured in Netlify dashboard

### Backend (Server)
- Deploy to your preferred hosting service
- Configure production environment variables
- Set up SSL certificates for HTTPS

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review console logs for error messages
- Ensure all dependencies are installed correctly

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch.

- **Live Site**: https://credion.com.au
- **Staging**: https://credion.netlify.app

## Contact

For questions about this project, contact the development team.