# 🚢 Marine Parts Marketplace

A modern, full-featured e-commerce platform for buying and selling marine/ship parts. Built with React, Vite, and Firebase.

![React](https://img.shields.io/badge/React-18.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Firebase](https://img.shields.io/badge/Firebase-12.12-orange)

## ✨ Features

### 👥 User Management
- **Authentication**: Secure login and registration with email verification
- **Role-based Access**: Buyer, Seller, and Admin roles
- **User Profiles**: Manage account details and preferences
- **Dark Mode**: Toggle between light and dark themes

### 🛒 E-Commerce Functionality
- **Browse Listings**: Browse all available marine parts with detailed descriptions and pricing
- **Shopping Cart**: Add/remove items, manage quantities, persistent cart storage
- **Order Management**: View order history, track purchases, and review order status
- **Responsive Design**: Seamless experience on desktop and mobile devices

### 🏪 Seller Features
- **Add Listings**: Create new product listings with images and descriptions
- **Manage Inventory**: Edit or delete your listed products
- **Sales Dashboard**: View listings you've created
- **Image Upload**: Integrated Cloudinary for reliable image hosting

### 👨‍💼 Admin Dashboard
- **System Management**: Administrative controls and monitoring
- **User Management**: Manage users and permissions
- **Content Moderation**: Review and manage listings

### 🎨 Technical Highlights
- **Code Splitting**: Lazy-loaded pages for optimal performance
- **Real-time Notifications**: Toast notifications for user feedback
- **Skeleton Loading**: Professional loading states
- **Protected Routes**: Role-based route protection
- **Context API**: State management for authentication and cart
- **Responsive UI**: Mobile-first design approach

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/slklnarnv/parts-marketplace.git
   cd parts-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_NAME=your_cloudinary_name
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## 🗂️ Project Structure

```
src/
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── SignUp.jsx
│   ├── Listings.jsx
│   ├── Cart.jsx
│   ├── AddListing.jsx
│   ├── MyListings.jsx
│   ├── EditListing.jsx
│   ├── OrderHistory.jsx
│   └── AdminPage.jsx
├── services/           # API services
│   ├── authService.js
│   ├── cartService.js
│   ├── listingService.js
│   ├── reviewService.js
│   ├── transactionService.js
│   └── userService.js
├── components/         # Reusable components
│   ├── Navbar.jsx
│   ├── CartContext.jsx
│   ├── AuthContext.jsx
│   └── ThemeToggle.jsx
└── App.jsx            # Main app component
```

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Backend**: Firebase
- **Image Management**: Cloudinary
- **Styling**: CSS
- **State Management**: React Context API

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔐 Security

- Authentication via Firebase Authentication
- Role-based access control for protected routes
- Secure session management
- Environment variable protection for sensitive data

## 🚀 Deployment

The project includes a `vercel.json` configuration for easy deployment to Vercel:

```bash
npm run build
vercel deploy
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support, open an issue on the [GitHub Issues](https://github.com/slklnarnv/parts-marketplace/issues) page.

---

**Made with ❤️ by the MarineParts Team**
