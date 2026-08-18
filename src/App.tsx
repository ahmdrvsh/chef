import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ScrollToTop } from './components/ScrollToTop';
const LandingPage = React.lazy(() => import('./pages/Landing').then(module => ({ default: module.LandingPage })));
const AuthLandingPage = React.lazy(() => import('./pages/AuthLandingPage').then(module => ({ default: module.AuthLandingPage })));
const RecipesPage = React.lazy(() => import('./pages/Recipes').then(module => ({ default: module.RecipesPage })));
const RecipeDetailPage = React.lazy(() => import('./pages/RecipeDetail').then(module => ({ default: module.RecipeDetailPage })));
const CategoryFilteredRecipesPage = React.lazy(() => import('./pages/CategoryFilteredRecipesPage').then(module => ({ default: module.CategoryFilteredRecipesPage })));
const FridgePage = React.lazy(() => import('./pages/Fridge').then(module => ({ default: module.FridgePage })));
const WhatToCookPage = React.lazy(() => import('./pages/WhatToCook').then(module => ({ default: module.WhatToCookPage })));
const SuggestionsPage = React.lazy(() => import('./pages/Suggestions').then(module => ({ default: module.SuggestionsPage })));
const ShoppingListPage = React.lazy(() => import('./pages/ShoppingList').then(module => ({ default: module.ShoppingListPage })));
const FavoritesPage = React.lazy(() => import('./pages/Favorites').then(module => ({ default: module.FavoritesPage })));
const ProfilePage = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.ProfilePage })));
const AdminPage = React.lazy(() => import('./pages/Admin').then(module => ({ default: module.AdminPage })));

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-emerald-600 animate-pulse font-bold text-sm">در حال بارگذاری...</div>}><Routes>
      {/* Public Landing Route - accessible explicitly at /landing regardless of auth status */}
      <Route path="/landing" element={<LandingPage />} />

      {!user ? (
        /* Unauthenticated User Routes */
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthLandingPage defaultTab="login" />} />
          <Route path="/register" element={<AuthLandingPage defaultTab="register" />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* Authenticated User Application Routes */
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 font-vazir overflow-x-hidden antialiased">
              <Navbar />
              <main className="flex-1 pb-28 md:pb-12">
                <Suspense fallback={<div className="flex h-screen items-center justify-center text-emerald-600 animate-pulse font-bold text-sm">در حال بارگذاری...</div>}><Routes>
                  <Route path="/" element={<Navigate to="/recipes" replace />} />
                  <Route path="/login" element={<Navigate to="/recipes" replace />} />
                  <Route path="/register" element={<Navigate to="/recipes" replace />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/recipes/category" element={<CategoryFilteredRecipesPage />} />
                  <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                  <Route path="/fridge" element={<FridgePage />} />
                  <Route path="/what-to-cook" element={<WhatToCookPage />} />
                  <Route path="/suggestions" element={<SuggestionsPage />} />
                  <Route path="/shopping-list" element={<ShoppingListPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route
                    path="/admin"
                    element={user.isAdmin ? <AdminPage /> : <Navigate to="/recipes" replace />}
                  />
                  <Route path="*" element={<Navigate to="/recipes" replace />} />
                </Routes></Suspense>
              </main>

              <MobileBottomNav />

              <footer className="bg-white border-t border-stone-200/80 py-6 mt-12 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-500 space-y-1">
                  <p className="font-bold text-stone-700">سفره - دستیار هوشمند آشپزی و برنامه‌ریزی غذا</p>
                  <p>© تمامی حقوق محفوظ است.</p>
                </div>
              </footer>
            </div>
          }
        />
      )}
    </Routes></Suspense>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
