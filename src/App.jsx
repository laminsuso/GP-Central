import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ThemeProvider from './contexts/ThemeContext'
import I18nProvider from './contexts/I18nContext'
import AuthProvider from './contexts/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import FindPage from './pages/Find'
import BecomeGPPage from './pages/BecomeGP'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import AccountPage from './pages/Account'
import IdentityPage from './pages/Identity'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import Home from './pages/Home'
import ProfilePage from './pages/Profile'


export default function App(){
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <div className="min-h-screen">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/find" element={<FindPage />} />
              <Route path="/devenir-gp" element={<ProtectedRoute><RoleRoute roles={['traveler']} requireIdentity><BecomeGPPage/></RoleRoute></ProtectedRoute>} />
              <Route path="/verify-identity" element={<ProtectedRoute><IdentityPage/></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountPage/></ProtectedRoute>} />
               <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage/>} />
              <Route path="/signup" element={<SignupPage/>} />
              <Route path="*" element={<div className="mx-auto max-w-md p-8"><h2 className="text-2xl font-bold mb-2">404</h2><p className="text-gray-600">Page not found.</p></div>} />
            </Routes>
            <Footer />
          </div>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
