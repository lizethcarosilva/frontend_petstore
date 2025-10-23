# Pet Store Management System

A comprehensive web application for managing a pet store business, built with React, TypeScript, and Tailwind CSS.

## Features

### 🏠 Dashboard
- Real-time KPI widgets (appointments, inventory, sales)
- Sales charts and analytics
- Low stock alerts
- Expiring products notifications
- Chatbot integration (placeholder for future API)

### 👥 User Management
- Complete CRUD operations for users
- Role-based access control
- User activation/deactivation
- Search and filter functionality

### 🏢 Tenant Management
- Multi-tenant support for different companies
- Tenant activation/deactivation
- Plan-based tenant categorization
- Company information management

### 🐕 Pet Management
- Pet registration and management
- Owner-pet relationship tracking
- Special care instructions
- Pet type and breed categorization

### 🩺 Service Management
- Veterinary service catalog
- Service pricing management
- Service activation/deactivation
- Service search and filtering

### 📦 Product Management
- Product inventory tracking
- Stock level monitoring
- Expiration date tracking
- Low stock alerts
- Product categorization

### 📅 Appointment Management
- Appointment scheduling
- Date and time slot selection
- Veterinarian assignment
- Appointment status tracking
- Diagnosis and observations

### 💰 Invoice/Sales Management
- Sales transaction recording
- Product and service selection
- Client and employee assignment
- Discount management
- Payment processing
- Invoice generation

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Build Tool**: Vite

## API Integration

The application integrates with a comprehensive REST API that includes:

- **Tenant API**: Multi-tenant company management
- **User API**: User authentication and management
- **Pet API**: Pet registration and tracking
- **Service API**: Veterinary services management
- **Product API**: Product inventory management
- **Appointment API**: Appointment scheduling and tracking
- **Invoice API**: Sales and billing management
- **Dashboard API**: Analytics and reporting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend_petstore
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_API_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar navigation
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard with KPIs and analytics
│   ├── Login.tsx       # Authentication page
│   ├── Users.tsx       # User management
│   ├── Tenants.tsx     # Tenant management
│   ├── Pets.tsx        # Pet management
│   ├── Services.tsx    # Service management
│   ├── Products.tsx    # Product management
│   ├── Appointments.tsx # Appointment management
│   └── Invoices.tsx    # Sales and invoice management
├── services/           # API service layer
│   └── api.ts         # API client configuration
├── types/              # TypeScript type definitions
│   └── index.ts       # Application types and interfaces
├── App.tsx            # Main application component
├── App.css            # Custom styles
└── main.tsx           # Application entry point
```

## Features Overview

### Authentication
- Secure login system
- Token-based authentication
- Protected routes
- User session management

### Responsive Design
- Mobile-first approach
- Responsive sidebar navigation
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### Data Management
- Real-time data synchronization
- Optimistic updates
- Error handling and recovery
- Loading states and feedback

### User Experience
- Intuitive navigation
- Search and filtering capabilities
- Form validation
- Confirmation dialogs
- Success/error notifications

## API Endpoints

The application connects to the following API endpoints:

### Tenant Management
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants/create` - Create new tenant
- `PUT /api/tenants/update` - Update tenant
- `PUT /api/tenants/activate/{id}` - Activate tenant
- `PUT /api/tenants/deactivate/{id}` - Deactivate tenant

### User Management
- `POST /api/users/login` - User authentication
- `GET /api/users` - Get all users
- `POST /api/users/create` - Create new user
- `PUT /api/users/update` - Update user
- `DELETE /api/users/deleteUser` - Delete user

### Pet Management
- `GET /api/pets` - Get all pets
- `POST /api/pets/create` - Create new pet
- `PUT /api/pets/update` - Update pet
- `DELETE /api/pets/deletePet` - Delete pet

### Service Management
- `GET /api/services` - Get all services
- `POST /api/services/create` - Create new service
- `PUT /api/services/update` - Update service
- `DELETE /api/services/deleteService` - Delete service

### Product Management
- `GET /api/products` - Get all products
- `POST /api/products/create` - Create new product
- `PUT /api/products/update` - Update product
- `GET /api/products/lowStock` - Get low stock products
- `GET /api/products/expiringSoon` - Get expiring products

### Appointment Management
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments/create` - Create new appointment
- `PUT /api/appointments/update` - Update appointment
- `PUT /api/appointments/complete` - Complete appointment
- `PUT /api/appointments/cancel` - Cancel appointment

### Invoice Management
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices/create` - Create new invoice
- `PUT /api/invoices/updateStatus` - Update invoice status
- `GET /api/invoices/sales/today` - Get today's sales
- `GET /api/invoices/sales/month` - Get monthly sales

### Dashboard Analytics
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/sales/stats` - Get sales statistics
- `GET /api/dashboard/products/lowStock` - Get low stock alerts
- `GET /api/dashboard/products/expiringSoon` - Get expiring products

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.