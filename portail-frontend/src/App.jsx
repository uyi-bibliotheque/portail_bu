// App.jsx - VERSION COMPLÈTE MIS À JOUR (E-Ressources + Périodiques + Open Access)
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Pages principales chargées immédiatement
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';

// ═══════════════════════════════════════════════════════════════════
// LAZY LOADING - Pages secondaires
// ═══════════════════════════════════════════════════════════════════

const NoticeDetailPage = lazy(() => import('./pages/NoticeDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MonComptePage = lazy(() => import('./pages/MonComptePage'));
const DepotPage = lazy(() => import('./pages/DepotInstitutionnel'));
const ActualitesPage = lazy(() => import('./pages/ActualitesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ActualitesPage').then(m => ({ default: m.ArticleDetailPage })));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FavorisPage = lazy(() => import('./pages/FavorisPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ArchivesPage = lazy(() => import('./pages/ArchivesPage'));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales'));
const Confidentialite = lazy(() => import('./pages/Confidentialite'));
const CGV = lazy(() => import('./pages/CGV'));
const PolitiqueCookies = lazy(() => import('./pages/PolitiqueCookies'));

// Staff Lazy
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffMemoires = lazy(() => import('./pages/staff/StaffMemoires'));
const StaffNotifications = lazy(() => import('./pages/staff/StaffNotifications'));
const StaffQuitus = lazy(() => import('./pages/staff/StaffQuitus'));
const AideBiblioDashboard = lazy(() => import('./pages/AideBiblioDashboard'));

// Admin Lazy
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminActualites = lazy(() => import('./pages/admin/AdminActualites'));

// ═══════════════════════════════════════════════════════════════════
// STATIC PAGES LAZY (toutes les pages exportées depuis StaticPages.jsx)
// ═══════════════════════════════════════════════════════════════════

const PresentationPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PresentationPage })));
const CoordinationPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.CoordinationPage })));
const SectionsPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.SectionsPage })));
const HorairesPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.HorairesPage })));
const ServicesPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ServicesPage })));
const RessourcesPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.RessourcesPage })));
const PeriodiquesPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PeriodiquesPage })));
const OpenAccessPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.OpenAccessPage })));
const ERessourcesPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ERessourcesPage })));
const ERessourcesDisciplinePage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ERessourcesDisciplinePage })));
const ThesesPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ThesesPage })));
const ChartePage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ChartePage })));
const PolitiquePage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PolitiquePage })));
const NotFoundPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.NotFoundPage })));

// Detail Pages Lazy
const NotificationDetailPage = lazy(() => import('./pages/NotificationDetailPage'));
const DepotDetailPage = lazy(() => import('./pages/DepotDetailPage'));
const LivresNumeriquesPage = lazy(() => import('./pages/LivresNumeriquesPage'));

const helmetContext = {};

// ═══════════════════════════════════════════════════════════════════
// ─── LOADER ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const RouteLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    background: 'var(--beige, #F5F3FF)'
  }}>
    <div style={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '3px solid var(--border, #EDE9FE)',
      borderTopColor: 'var(--or, #7C3AED)',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// 🎯 PROTECTED ROUTE — CORRIGÉE
// ═══════════════════════════════════════════════════════════════════
// ⚠️ ORDRE CRITIQUE de vérification des rôles pour la redirection :
//    1. isAdmin       → /admin/dashboard
//    2. isAideBiblio  → /aide-biblio        (AVANT isStaff !)
//    3. BIBLIO        → /staff
//    4. défaut        → /mon-compte
// ═══════════════════════════════════════════════════════════════════

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAdmin, isAideBiblio } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--beige, #F5F3FF)'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid var(--border, #EDE9FE)',
          borderTopColor: 'var(--or, #7C3AED)',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const hasAllowedRole = allowedRoles.includes(userRole);

    if (!hasAllowedRole) {
      if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
      if (isAideBiblio) return <Navigate to="/aide-biblio" replace />;
      if (userRole === 'BIBLIO') return <Navigate to="/staff" replace />;
      return <Navigate to="/mon-compte" replace />;
    }
  }

  return children;
}

// ═══════════════════════════════════════════════════════════════════
// ─── APP ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <HelmetProvider context={helmetContext}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                    {/* ══════════════════════════════════════════════
                        ── PUBLIC ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalogue" element={<CataloguePage />} />
                    <Route path="/catalogue/notice/:id" element={<NoticeDetailPage />} />
                    <Route path="/actualites" element={<ActualitesPage />} />
                    <Route path="/actualites/:id" element={<ArticleDetailPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/theses" element={<ThesesPage />} />
                    <Route path="/connexion" element={<LoginPage />} />
                    <Route path="/inscription" element={<RegisterPage />} />
                    <Route path="/favoris" element={<FavorisPage />} />
                    <Route path="/archives" element={<ArchivesPage />} />
                    <Route path="/mentions-legales" element={<MentionsLegales />} />
                    <Route path="/confidentialite" element={<Confidentialite />} />
                    <Route path="/cgv" element={<CGV />} />
                    <Route path="/politique-cookies" element={<PolitiqueCookies />} />

                    {/* ══════════════════════════════════════════════
                        ── RESSOURCES ÉLECTRONIQUES ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/ressources/electroniques" element={<RessourcesPage />} />
                    <Route path="/periodiques" element={<PeriodiquesPage />} />
                    <Route path="/open-access" element={<OpenAccessPage />} />
                    <Route path="/ressources/periodiques" element={<PeriodiquesPage />} />
                    <Route path="/ressources/open-access" element={<OpenAccessPage />} />

                    {/* ══════════════════════════════════════════════
                        ── E-RESSOURCES (8 disciplines) ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/E_ressources" element={<ERessourcesPage />} />
                    <Route path="/E_ressources1" element={<ERessourcesDisciplinePage slug="1" />} />
                    <Route path="/E_ressources2" element={<ERessourcesDisciplinePage slug="2" />} />
                    <Route path="/E_ressources3" element={<ERessourcesDisciplinePage slug="3" />} />
                    <Route path="/E_ressources4" element={<ERessourcesDisciplinePage slug="4" />} />
                    <Route path="/E_ressources5" element={<ERessourcesDisciplinePage slug="5" />} />
                    <Route path="/E_ressources6" element={<ERessourcesDisciplinePage slug="6" />} />
                    <Route path="/E_ressources7" element={<ERessourcesDisciplinePage slug="7" />} />
                    <Route path="/E_ressources8" element={<ERessourcesDisciplinePage slug="8" />} />

                    {/* ══════════════════════════════════════════════
                        ── BIBLIOTHÈQUE ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/bibliotheque/presentation" element={<PresentationPage />} />
                    <Route path="/bibliotheque/coordination" element={<CoordinationPage />} />
                    <Route path="/bibliotheque/departements" element={<PresentationPage />} />
                    <Route path="/bibliotheque/sections" element={<SectionsPage />} />
                    <Route path="/bibliotheque/politique" element={<PolitiquePage />} />
                    <Route path="/bibliotheque/horaires" element={<HorairesPage />} />
                    <Route path="/horaires" element={<HorairesPage />} />
                    <Route path="/charte" element={<ChartePage />} />

                    {/* ══════════════════════════════════════════════
                        ── SERVICES ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/services" element={<ServicesPage type="general" />} />
                    <Route path="/services/consultation" element={<ServicesPage type="consultation" />} />
                    <Route path="/services/wifi" element={<ServicesPage type="wifi" />} />
                    <Route path="/services/reliure" element={<ServicesPage type="reliure" />} />
                    <Route path="/services/mediation" element={<ServicesPage type="mediation" />} />
                    <Route path="/services/formation" element={<ServicesPage type="formation" />} />

                    {/* ══════════════════════════════════════════════
                        ── RESSOURCES GÉNÉRALES ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/livres-numeriques" element={<LivresNumeriquesPage />} />

                    {/* ══════════════════════════════════════════════
                        ── DÉPÔT INSTITUTIONNEL ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/depot/soumettre" element={<DepotPage />} />
                    <Route path="/depot/repertoire" element={<ThesesPage />} />
                    <Route path="/depot/:id" element={<DepotDetailPage />} />

                    {/* ══════════════════════════════════════════════
                        ── ESPACE PERSONNEL ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/mon-compte" element={<MonComptePage />} />
                    <Route path="/notifications/:id" element={<NotificationDetailPage />} />

                    {/* ══════════════════════════════════════════════
                        ── DASHBOARD (commun à tous les staffs) ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'BIBLIO', 'AIDE_BIBLIO']}>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />

                    {/* ══════════════════════════════════════════════
                        ── ADMIN (réservé au rôle ADMIN) ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/actualites" element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminActualites />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/utilisateurs" element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminUsers />
                      </ProtectedRoute>
                    } />

                    {/* ══════════════════════════════════════════════
                        ── STAFF (réservé aux BIBLIO + ADMIN) ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/staff" element={
                      <ProtectedRoute allowedRoles={['BIBLIO', 'ADMIN']}>
                        <StaffDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/memoires" element={
                      <ProtectedRoute allowedRoles={['BIBLIO', 'ADMIN']}>
                        <StaffMemoires />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/memoires/:id" element={
                      <ProtectedRoute allowedRoles={['BIBLIO', 'ADMIN']}>
                        <StaffMemoires />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/notifications" element={
                      <ProtectedRoute allowedRoles={['BIBLIO', 'ADMIN']}>
                        <StaffNotifications />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/quitus" element={
                      <ProtectedRoute allowedRoles={['BIBLIO', 'ADMIN']}>
                        <StaffQuitus />
                      </ProtectedRoute>
                    } />

                    {/* ══════════════════════════════════════════════
                        ── AIDE-BIBLIOTHÉCAIRE (réservé à AIDE_BIBLIO) ──
                        ══════════════════════════════════════════════ */}
                    <Route path="/aide-biblio" element={
                      <ProtectedRoute allowedRoles={['AIDE_BIBLIO']}>
                        <AideBiblioDashboard />
                      </ProtectedRoute>
                    } />

                    {/* ══════════════════════════════════════════════
                        ── 404 ──
                        ══════════════════════════════════════════════ */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}