// components/layout/Header.jsx - VERSION FINALE CORRIGÉE + LANGUE VISIBLE SUR MOBILE
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, X, Bell, User, LogOut, ChevronDown,
  BookOpen, FileText, Globe, Library, BarChart2,
  Heart, Home, Shield, ChevronRight, Archive,
  BookMarked, Users, Settings
} from 'lucide-react';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import NotificationBell from '../notifications/NotificationBell';

const NAV = [
  {
    labelFr: 'Accueil',
    labelEn: 'Home',
    href: '/',
    icon: <Home size={18} />
  },
  {
    labelFr: 'Bibliothèque',
    labelEn: 'Library',
    icon: <Library size={18} />,
    children: [
      { labelFr: 'Présentation', labelEn: 'Presentation', href: '/bibliotheque/presentation' },
      { labelFr: 'Coordination', labelEn: 'Coordination', href: '/bibliotheque/coordination' },
      { labelFr: 'Départements', labelEn: 'Departments', href: '/bibliotheque/departements' },
      { labelFr: 'Sections & Unités', labelEn: 'Sections & Units', href: '/bibliotheque/sections' },
      { labelFr: 'Politique documentaire', labelEn: 'Documentary policy', href: '/bibliotheque/politique' },
    ],
  },
  {
    labelFr: 'Services',
    labelEn: 'Services',
    icon: <BookOpen size={18} />,
    children: [
      { labelFr: 'Médiation documentaire', labelEn: 'Documentary mediation', href: '/services/mediation' },
      { labelFr: 'Espace consultation', labelEn: 'Consultation area', href: '/services/consultation' },
      { labelFr: 'Reliure', labelEn: 'Binding', href: '/services/reliure' },
      { labelFr: 'Accès WiFi', labelEn: 'WiFi access', href: '/services/wifi' },
      { labelFr: 'Formation documentaire', labelEn: 'Documentary training', href: '/services/formation' },
    ],
  },
  {
    labelFr: 'Ressources',
    labelEn: 'Resources',
    icon: <Globe size={18} />,
    children: [
      { labelFr: 'Livres électroniques', labelEn: 'E-books', href: '/livres-numeriques' },
      { labelFr: 'Catalogue OPAC', labelEn: 'OPAC catalog', href: '/catalogue' },
      { labelFr: 'Thèses & Mémoires', labelEn: 'Theses & Dissertations', href: '/archives' },
      { labelFr: 'E-Ressources', labelEn: 'E-resources', href: '/ressources/electroniques' },
      { labelFr: 'Ressources par discipline', labelEn: 'Resources by discipline', href: '/E_ressources' },
      { labelFr: 'Périodiques électroniques', labelEn: 'Electronic journals', href: '/periodiques' },
      { labelFr: 'Open Access', labelEn: 'Open Access', href: '/open-access' },
    ],
  },
  {
    labelFr: 'Dépôt',
    labelEn: 'Deposit',
    icon: <FileText size={18} />,
    children: [
      { labelFr: 'Déposer un mémoire', labelEn: 'Submit a dissertation', href: '/depot/soumettre' },
      { labelFr: 'Répertoire thèses', labelEn: 'Thesis directory', href: '/archives' },
    ],
  },
  {
    labelFr: 'Actualités',
    labelEn: 'News',
    href: '/actualites',
    icon: <Bell size={18} />
  },
  {
    labelFr: 'Contact',
    labelEn: 'Contact',
    href: '/contact',
    icon: <User size={18} />
  },
];

export default function Header({ onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpand, setMobileExpand] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();

  const {
    user,
    logout,
    isStaff,
    isAdmin,
    isAideBiblio,
    getHomeRoute,
    getHomeLabel,
    getRoleDisplay,
  } = useAuth();

  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 992);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (label) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setHoveredItem(label);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setHoveredItem(null), 300);
    setDropdownTimeout(timeout);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/catalogue?q=${encodeURIComponent(searchQ.trim())}`);
    setSearchOpen(false);
    setSearchQ('');
  };

  const translateLabel = (item) => (language === 'en' ? (item.labelEn || item.labelFr) : item.labelFr);

  const handleLogout = () => {
    logout();
    addToast(language === 'en' ? 'Logout successful' : 'Déconnexion réussie', 'success');
    navigate('/');
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMobile = (label) =>
    setMobileExpand(prev => ({ ...prev, [label]: !prev[label] }));

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(child => location.pathname.startsWith(child.href));
  };

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield size={16} />;
    if (isAideBiblio) return <BookMarked size={16} />;
    if (user?.role === 'BIBLIO') return <FileText size={16} />;
    return <User size={16} />;
  };

  const getDashboardClass = () => {
    if (isAdmin) return 'admin';
    if (isAideBiblio) return 'aide';
    if (user?.role === 'BIBLIO') return 'staff';
    return 'user';
  };

  const getLogoLink = () => {
    if (user) return getHomeRoute();
    return '/';
  };

  const getUserInitial = () => {
    if (!user) return '?';
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    return '?';
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to={getLogoLink()} className="logo-link">
            <img src={logo} alt="BCUYI - Bibliothèque Centrale Universitaire" className="logo-img" />
            <div className="logo-text">
              <span className="logo-text-main">BC<span>UYI</span></span>
              <span className="logo-text-sub">BIBLIOTHÈQUE CENTRALE</span>
            </div>
          </Link>

          <nav className="desktop-nav" role="navigation" aria-label="Navigation principale">
            <ul className="nav-list">
              {NAV.map((item) => (
                <li
                  key={item.labelFr}
                  className="nav-item"
                  onMouseEnter={() => item.children && handleMouseEnter(item.labelFr)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.href ? (
                    <Link
                      to={item.href}
                      className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    >
                      {item.icon}
                      {translateLabel(item)}
                    </Link>
                  ) : (
                    <>
                      <button
                        className={`nav-link ${isChildActive(item.children) ? 'active' : ''}`}
                        type="button"
                      >
                        {item.icon}
                        {translateLabel(item)}
                        <ChevronDown
                          size={14}
                          className={`dropdown-chevron ${hoveredItem === item.labelFr ? 'rotated' : ''}`}
                        />
                      </button>

                      <div className={`dropdown ${hoveredItem === item.labelFr ? 'visible' : ''}`}>
                        <div className="dropdown-content">
                          <div className="dropdown-header">{translateLabel(item)}</div>
                          {item.children.map(child => (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={() => setHoveredItem(null)}
                              className={`dropdown-link ${isActive(child.href) ? 'active' : ''}`}
                            >
                              <span>{language === 'en' ? (child.labelEn || child.labelFr) : child.labelFr}</span>
                              {isActive(child.href) && <span className="dropdown-dot" />}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`search-toggle ${searchOpen ? 'active' : ''}`}
              aria-label={language === 'en' ? 'Search' : 'Rechercher'}
            >
              <Search size={18} />
            </button>

            {/* ✅ SÉLECTEUR DE LANGUE — maintenant visible sur mobile */}
            <div className="language-switcher" aria-label="Sélecteur de langue">
              <button
                type="button"
                className={language === 'fr' ? 'language-option active' : 'language-option'}
                onClick={() => setLanguage('fr')}
                aria-label="Français"
              >
                FR
              </button>
              <button
                type="button"
                className={language === 'en' ? 'language-option active' : 'language-option'}
                onClick={() => setLanguage('en')}
                aria-label="English"
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="user-actions">
                <NotificationBell className="notification-bell-header" />

                <Link
                  to="/favoris"
                  className="action-btn"
                  aria-label={t('common', 'favorites', 'Mes favoris')}
                  title={t('common', 'favorites', 'Mes favoris')}
                >
                  <Heart size={18} />
                </Link>

                <Link
                  to={getHomeRoute()}
                  className={`dashboard-btn ${getDashboardClass()}`}
                  title={getHomeLabel()}
                >
                  <div className="dashboard-avatar">
                    {getUserInitial()}
                  </div>
                  <span className="dashboard-label">{getHomeLabel()}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  aria-label="Déconnexion"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/connexion" className="btn-login">
                <User size={16} /> {t('common', 'login', 'Connexion')}
              </Link>
            )}

            <button
              className="mobile-burger"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-overlay" ref={searchRef}>
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <Search size={20} className="search-icon" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder={language === 'en' ? 'Title, author, ISBN, subject…' : 'Titre, auteur, ISBN, sujet…'}
                  className="search-input"
                />
                <button type="submit" className="search-submit">
                  {t('common', 'search', 'Rechercher')}
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-drawer-panel">
            <div className="drawer-header">
              <span className="drawer-logo">BCU <span>UYI</span></span>
              <button onClick={() => setMobileOpen(false)} className="drawer-close">
                <X size={22} />
              </button>
            </div>

            {user && (
              <div className="drawer-user">
                <div className="drawer-user-avatar">
                  {getUserInitial()}
                </div>
                <div className="drawer-user-info">
                  <div className="drawer-user-name">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                  </div>
                  <div className="drawer-user-email">{user.email}</div>
                  <div className={`drawer-user-role ${isStaff ? 'staff' : ''}`}>
                    {getRoleDisplay()}
                  </div>
                </div>
                {isStaff && <div className="drawer-user-badge">Staff</div>}
                <div className="drawer-notification-mobile">
                  <NotificationBell />
                </div>
              </div>
            )}

            {/* ✅ Sélecteur de langue dans le drawer mobile */}
            <div className="drawer-language-switcher">
              <span className="drawer-language-label">
                {language === 'en' ? 'Language' : 'Langue'}
              </span>
              <div className="language-switcher">
                <button
                  type="button"
                  className={language === 'fr' ? 'language-option active' : 'language-option'}
                  onClick={() => setLanguage('fr')}
                >
                  FR
                </button>
                <button
                  type="button"
                  className={language === 'en' ? 'language-option active' : 'language-option'}
                  onClick={() => setLanguage('en')}
                >
                  EN
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="drawer-search">
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={language === 'en' ? 'Search…' : 'Rechercher…'}
                className="drawer-search-input"
              />
              <button type="submit" className="drawer-search-btn">
                <Search size={18} />
              </button>
            </form>

            <nav className="drawer-nav">
              {NAV.map((item) => {
                const isActiveLink = item.href ? isActive(item.href) : false;
                return (
                  <div key={item.labelFr}>
                    {item.href ? (
                      <Link
                        to={item.href}
                        className={`drawer-link ${isActiveLink ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.icon}
                        {translateLabel(item)}
                        {isActiveLink && <span className="drawer-link-dot" />}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleMobile(item.labelFr)}
                          className="drawer-link drawer-link-parent"
                          type="button"
                        >
                          <span className="drawer-link-content">
                            {item.icon}
                            {translateLabel(item)}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`drawer-chevron ${mobileExpand[item.labelFr] ? 'rotated' : ''}`}
                          />
                        </button>
                        {mobileExpand[item.labelFr] && (
                          <div className="drawer-submenu">
                            {item.children.map(child => (
                              <Link
                                key={child.href}
                                to={child.href}
                                className={`drawer-sub-link ${isActive(child.href) ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                              >
                                <span>{language === 'en' ? (child.labelEn || child.labelFr) : child.labelFr}</span>
                                {isActive(child.href) && <span className="drawer-link-dot" />}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="drawer-footer">
              {user ? (
                <>
                  <Link
                    to={getHomeRoute()}
                    className="drawer-footer-btn primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {getDashboardIcon()} {getHomeLabel()}
                  </Link>
                  <Link to="/favoris" className="drawer-footer-btn secondary" onClick={() => setMobileOpen(false)}>
                    <Heart size={16} /> {t('common', 'favorites', 'Mes favoris')}
                  </Link>
                  <button onClick={handleLogout} className="drawer-footer-btn logout">
                    <LogOut size={16} /> {t('common', 'logout', 'Se déconnecter')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="drawer-footer-btn primary" onClick={() => setMobileOpen(false)}>
                    <User size={16} /> {t('common', 'login', 'Connexion')}
                  </Link>
                  <Link to="/contact" className="drawer-footer-btn secondary" onClick={() => setMobileOpen(false)}>
                    {t('common', 'contact', 'Contact')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .language-switcher {
          display: inline-flex;
          align-items: center;
          background: #f4f3f6;
          border-radius: 999px;
          padding: 3px;
          border: 1px solid rgba(27, 20, 100, 0.08);
          flex-shrink: 0;
        }
        .language-option {
          background: transparent;
          border: none;
          color: #4b5563;
          font-weight: 700;
          font-size: 10px;
          padding: 5px 8px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .language-option.active {
          background: var(--or, #7c3aed);
          color: white;
          box-shadow: 0 3px 8px rgba(124, 58, 237, 0.25);
        }
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: white;
          border-bottom: 1px solid rgba(27, 20, 100, 0.08);
          transition: all 0.3s ease;
        }
        .header.scrolled {
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.06);
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 8px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 12px 0 0;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
          margin-left: -8px;
          padding-left: 12px;
        }
        .logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-text-main {
          font-size: 20px;
          font-weight: 800;
          color: var(--bleu-nuit, #1B1464);
        }
        .logo-text-main span {
          color: var(--or, #7C3AED);
        }
        .logo-text-sub {
          font-size: 9px;
          font-weight: 600;
          color: var(--texte-muted, #64748b);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .desktop-nav {
          display: flex;
          flex: 1;
          justify-content: flex-start;
          margin-left: 4px;
          min-width: 0;
        }
        .nav-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2px;
        }
        .nav-item {
          position: relative;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--texte, #1e293b);
          text-decoration: none;
          transition: all 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          position: relative;
          white-space: nowrap;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--or, #7C3AED);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 50%;
        }
        .nav-link:hover {
          background: rgba(27, 20, 100, 0.04);
          color: var(--bleu-nuit, #1B1464);
        }
        .nav-link.active {
          color: var(--bleu-nuit, #1B1464);
          font-weight: 600;
        }
        .dropdown-chevron {
          transition: transform 0.3s ease;
        }
        .dropdown-chevron.rotated {
          transform: rotate(180deg);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 250px;
          padding: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(27, 20, 100, 0.15);
          border: 1px solid rgba(27, 20, 100, 0.08);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s;
          z-index: 100;
        }
        .dropdown::before {
          content: '';
          position: absolute;
          top: -16px;
          left: 0;
          right: 0;
          height: 16px;
          background: transparent;
        }
        .dropdown.visible,
        .nav-item:hover .dropdown,
        .nav-item:focus-within .dropdown {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }
        .nav-item:hover .dropdown-chevron,
        .nav-item:focus-within .dropdown-chevron {
          transform: rotate(180deg);
        }
        .dropdown-content {
          padding: 4px 0;
        }
        .dropdown-header {
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--texte-muted, #64748b);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 4px;
        }
        .dropdown-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--texte, #1e293b);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .dropdown-link:hover {
          background: var(--beige, #F5F3FF);
          color: var(--bleu-nuit, #1B1464);
        }
        .dropdown-link.active {
          background: rgba(27, 20, 100, 0.06);
          color: var(--bleu-nuit, #1B1464);
          font-weight: 600;
        }
        .dropdown-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--or, #7C3AED);
          flex-shrink: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .search-toggle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--texte-muted, #64748b);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .search-toggle:hover {
          background: var(--beige, #F5F3FF);
          color: var(--bleu-nuit, #1B1464);
        }
        .search-toggle.active {
          background: var(--bleu-nuit, #1B1464);
          color: white;
        }
        .user-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 6px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: var(--texte-muted, #64748b);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .action-btn:hover {
          background: var(--beige, #F5F3FF);
          color: var(--bleu-nuit, #1B1464);
        }

        .notification-bell-header {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .notification-bell-header .notification-bell-btn {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background: transparent !important;
          transition: all 0.2s ease !important;
          color: var(--texte-muted, #64748b) !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }
        .notification-bell-header .notification-bell-btn:hover {
          background: rgba(124, 58, 237, 0.08) !important;
          color: #7c3aed !important;
        }
        .notification-bell-header .notification-bell-btn svg {
          width: 18px !important;
          height: 18px !important;
        }
        .notification-bell-header .notification-badge {
          background: #7c3aed !important;
          border: 2px solid white !important;
          font-size: 8px !important;
          min-width: 16px !important;
          height: 16px !important;
          transform: translate(4px, -4px) !important;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3) !important;
        }
        .notification-bell-header .notification-dot {
          background: #7c3aed !important;
          border: 2px solid white !important;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3) !important;
        }

        .dashboard-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 12px 3px 3px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          color: var(--texte-muted, #64748b);
          text-decoration: none;
          transition: all 0.25s ease;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: transparent;
          white-space: nowrap;
        }
        .dashboard-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.10);
        }
        .dashboard-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          background: rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }
        .dashboard-label {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .dashboard-btn.admin {
          background: var(--bleu-nuit, #1B1464);
          color: white;
          border-color: var(--bleu-nuit, #1B1464);
        }
        .dashboard-btn.admin .dashboard-avatar {
          background: rgba(255, 255, 255, 0.20);
        }
        .dashboard-btn.staff {
          background: #7C3AED;
          color: white;
          border-color: #7C3AED;
        }
        .dashboard-btn.staff .dashboard-avatar {
          background: rgba(255, 255, 255, 0.20);
        }
        .dashboard-btn.aide {
          background: #8B5CF6;
          color: white;
          border-color: #8B5CF6;
        }
        .dashboard-btn.aide .dashboard-avatar {
          background: rgba(255, 255, 255, 0.20);
        }
        .dashboard-btn.user {
          background: var(--beige, #F5F3FF);
          color: var(--bleu-nuit, #1B1464);
          border-color: rgba(27, 20, 100, 0.10);
        }
        .dashboard-btn.user .dashboard-avatar {
          background: var(--bleu-nuit, #1B1464);
        }

        .logout-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--texte-muted, #64748b);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: var(--red, #ef4444);
        }

        .btn-login {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 50px;
          background: var(--bleu-nuit, #1B1464);
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          box-shadow: 0 2px 8px rgba(27, 20, 100, 0.2);
        }
        .btn-login:hover {
          background: var(--bleu-nuit-light, #2D2178);
          transform: scale(1.04);
          box-shadow: 0 4px 16px rgba(27, 20, 100, 0.3);
        }

        .mobile-burger {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--beige, #F5F3FF);
          border: 1px solid rgba(0, 0, 0, 0.06);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--texte, #1e293b);
          flex-shrink: 0;
        }
        .mobile-burger:hover {
          background: var(--beige-dark, #EDE9FE);
          border-color: var(--or, #7C3AED);
        }

        .search-overlay {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 12px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          z-index: 50;
        }
        .search-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .search-form {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--beige, #F5F3FF);
          border-radius: 10px;
          padding: 3px 3px 3px 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: border-color 0.2s ease;
        }
        .search-form:focus-within {
          border-color: var(--or, #7C3AED);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }
        .search-icon {
          color: var(--texte-muted, #64748b);
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          padding: 8px 0;
          border: none;
          background: transparent;
          font-size: 14px;
          font-family: inherit;
          color: var(--texte, #1e293b);
          outline: none;
        }
        .search-input::placeholder {
          color: var(--texte-light, #94a3b8);
        }
        .search-submit {
          padding: 8px 20px;
          border: none;
          border-radius: 8px;
          background: var(--bleu-nuit, #1B1464);
          color: white;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          flex-shrink: 0;
        }
        .search-submit:hover {
          background: var(--bleu-nuit-light, #2D2178);
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
        }
        .mobile-drawer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
        }
        .mobile-drawer-panel {
          position: relative;
          width: 340px;
          max-width: 85vw;
          height: 100%;
          background: white;
          padding: 20px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .drawer-logo {
          font-size: 20px;
          font-weight: 800;
          color: var(--bleu-nuit, #1B1464);
        }
        .drawer-logo span {
          color: var(--or, #7C3AED);
        }
        .drawer-close {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--beige, #F5F3FF);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--texte-muted, #64748b);
        }
        .drawer-close:hover {
          background: var(--beige-dark, #EDE9FE);
        }
        .drawer-user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: var(--beige, #F5F3FF);
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
        }
        .drawer-user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: white;
          background: var(--bleu-nuit, #1B1464);
          flex-shrink: 0;
        }
        .drawer-user-info {
          flex: 1;
        }
        .drawer-user-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--texte, #1e293b);
        }
        .drawer-user-email {
          font-size: 12px;
          color: var(--texte-muted, #64748b);
        }
        .drawer-user-role {
          font-size: 11px;
          color: var(--texte-muted, #64748b);
          font-weight: 500;
          margin-top: 2px;
        }
        .drawer-user-role.staff {
          color: var(--or, #7C3AED);
        }
        .drawer-user-badge {
          padding: 2px 10px;
          border-radius: 50px;
          background: var(--or, #7C3AED);
          color: white;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .drawer-notification-mobile {
          margin-left: 4px;
        }
        .drawer-notification-mobile .notification-bell-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          background: transparent !important;
          color: var(--texte-muted, #64748b) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }
        .drawer-search {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .drawer-search-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease;
          color: var(--texte, #1e293b);
          background: var(--beige, #F5F3FF);
        }
        .drawer-search-input:focus {
          border-color: var(--or, #7C3AED);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }
        .drawer-search-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          background: var(--bleu-nuit, #1B1464);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drawer-search-btn:hover {
          background: var(--bleu-nuit-light, #2D2178);
        }

        .drawer-language-switcher {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--beige, #F5F3FF);
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .drawer-language-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--texte-muted, #64748b);
        }

        .drawer-nav {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
        }
        .drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--texte, #1e293b);
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          text-align: left;
        }
        .drawer-link.active {
          color: var(--bleu-nuit, #1B1464);
          font-weight: 700;
        }
        .drawer-link:hover {
          color: var(--bleu-nuit, #1B1464);
        }
        .drawer-link-dot {
          margin-left: auto;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--or, #7C3AED);
          flex-shrink: 0;
        }
        .drawer-link-parent {
          justify-content: space-between;
        }
        .drawer-link-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .drawer-chevron {
          transition: transform 0.3s ease;
          color: var(--texte-muted, #64748b);
        }
        .drawer-chevron.rotated {
          transform: rotate(180deg);
        }
        .drawer-submenu {
          padding-left: 44px;
          padding-bottom: 8px;
          background: var(--beige, #F5F3FF);
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .drawer-sub-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: var(--texte-muted, #64748b);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .drawer-sub-link:hover {
          background: white;
          color: var(--bleu-nuit, #1B1464);
        }
        .drawer-sub-link.active {
          color: var(--bleu-nuit, #1B1464);
          font-weight: 600;
        }
        .drawer-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drawer-footer-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .drawer-footer-btn.primary {
          background: var(--bleu-nuit, #1B1464);
          color: white;
        }
        .drawer-footer-btn.primary:hover {
          background: var(--bleu-nuit-light, #2D2178);
        }
        .drawer-footer-btn.secondary {
          background: transparent;
          color: var(--texte, #1e293b);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .drawer-footer-btn.secondary:hover {
          border-color: var(--or, #7C3AED);
          color: var(--or, #7C3AED);
        }
        .drawer-footer-btn.logout {
          background: transparent;
          color: var(--red, #ef4444);
          border: 1px solid rgba(239, 68, 68, 0.15);
        }
        .drawer-footer-btn.logout:hover {
          background: rgba(239, 68, 68, 0.06);
          border-color: var(--red, #ef4444);
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dropdown {
          animation: dropdownFade 0.25s ease;
        }

        /* ✅ DESKTOP (≥ 993px) */
        @media (min-width: 993px) {
          .mobile-burger { display: none !important; }
          .drawer-notification-mobile { display: none !important; }
          .drawer-language-switcher { display: none !important; }
          .user-actions .action-btn,
          .user-actions .dashboard-btn,
          .user-actions .logout-btn {
            display: flex !important;
          }
          .desktop-nav { display: flex !important; }
          .language-switcher { display: inline-flex !important; }
        }

        /* ✅ TABLETTE / MOBILE (≤ 992px) — le language-switcher RESTE visible */
        @media (max-width: 992px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: flex !important; }

          /* Masquer les gros boutons utilisateur en haut, mais garder la cloche + langue */
          .user-actions .action-btn:not(.notification-bell-header),
          .user-actions .dashboard-btn,
          .user-actions .logout-btn {
            display: none !important;
          }
          .user-actions {
            padding: 0;
            background: transparent;
            border: none;
            backdrop-filter: none;
            gap: 4px;
          }

          /* ✅ Le sélecteur de langue reste visible sur mobile */
          .language-switcher {
            display: inline-flex !important;
            padding: 2px;
          }
          .language-option {
            font-size: 9px;
            padding: 4px 7px;
            min-width: 28px;
          }

          .header-inner { height: 64px; padding: 0 12px; }
          .logo-text-main { font-size: 17px; }
          .logo-text-sub { font-size: 7px; }
          .logo-img { width: 36px; height: 36px; }
          .search-toggle { width: 36px; height: 36px; }
          .search-toggle svg { width: 16px; height: 16px; }
          .btn-login { padding: 6px 14px; font-size: 12px; }
        }

        /* ✅ PETIT MOBILE (≤ 480px) — le language-switcher reste visible */
        @media (max-width: 480px) {
          .logo-text { display: none; }
          .logo-img { width: 32px; height: 32px; }
          .header-inner { height: 56px; padding: 0 10px; }
          .mobile-burger { width: 34px; height: 34px; }
          .mobile-burger svg { width: 18px; height: 18px; }
          .mobile-drawer-panel { padding: 16px 18px; width: 300px; }
          .drawer-user { padding: 12px 14px; }
          .drawer-user-avatar { width: 38px; height: 38px; font-size: 14px; }
          .drawer-user-name { font-size: 14px; }
          .drawer-link { font-size: 13px; padding: 10px 0; }
          .drawer-submenu { padding-left: 36px; }
          .drawer-footer-btn { font-size: 13px; padding: 10px; }
          .search-toggle { width: 32px; height: 32px; }
          .search-toggle svg { width: 14px; height: 14px; }

          /* ✅ Sélecteur de langue encore visible et compact */
          .language-switcher {
            display: inline-flex !important;
            padding: 2px;
          }
          .language-option {
            font-size: 8px;
            padding: 3px 6px;
            min-width: 24px;
          }

          .header-actions { gap: 4px; }
          .btn-login { padding: 5px 10px; font-size: 11px; }
          .btn-login svg { width: 14px; height: 14px; }
        }

        /* ✅ TRÈS PETIT MOBILE (≤ 360px) */
        @media (max-width: 360px) {
          .mobile-drawer-panel { padding: 12px 14px; width: 280px; }
          .drawer-link { font-size: 12px; padding: 8px 0; }
          .drawer-submenu { padding-left: 30px; }
          .language-option {
            font-size: 8px;
            padding: 3px 5px;
            min-width: 22px;
          }
          .header-inner { padding: 0 8px; gap: 4px; }
        }

        .mobile-drawer-panel::-webkit-scrollbar { width: 4px; }
        .mobile-drawer-panel::-webkit-scrollbar-track { background: var(--beige, #F5F3FF); }
        .mobile-drawer-panel::-webkit-scrollbar-thumb {
          background: var(--or, #7C3AED);
          border-radius: 2px;
        }
        .drawer-nav::-webkit-scrollbar { width: 3px; }
        .drawer-nav::-webkit-scrollbar-track { background: transparent; }
        .drawer-nav::-webkit-scrollbar-thumb {
          background: var(--or, #7C3AED);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}