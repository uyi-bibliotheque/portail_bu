// components/layout/Header.jsx
// VERSION FINALE — HEADER VIOLET + LANGUE VISIBLE SUR MOBILE

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, X, Bell, User, LogOut, ChevronDown,
  BookOpen, FileText, Globe, Library,
  Heart, Home, Shield, BookMarked
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
      {
        labelFr: 'Présentation',
        labelEn: 'Presentation',
        href: '/bibliotheque/presentation'
      },
      {
        labelFr: 'Coordination',
        labelEn: 'Coordination',
        href: '/bibliotheque/coordination'
      },
      {
        labelFr: 'Départements',
        labelEn: 'Departments',
        href: '/bibliotheque/departements'
      },
      {
        labelFr: 'Sections & Unités',
        labelEn: 'Sections & Units',
        href: '/bibliotheque/sections'
      },
      {
        labelFr: 'Politique documentaire',
        labelEn: 'Documentary policy',
        href: '/bibliotheque/politique'
      },
    ],
  },
  {
    labelFr: 'Services',
    labelEn: 'Services',
    icon: <BookOpen size={18} />,
    children: [
      {
        labelFr: 'Médiation documentaire',
        labelEn: 'Documentary mediation',
        href: '/services/mediation'
      },
      {
        labelFr: 'Espace consultation',
        labelEn: 'Consultation area',
        href: '/services/consultation'
      },
      {
        labelFr: 'Reliure',
        labelEn: 'Binding',
        href: '/services/reliure'
      },
      {
        labelFr: 'Accès WiFi',
        labelEn: 'WiFi access',
        href: '/services/wifi'
      },
      {
        labelFr: 'Formation documentaire',
        labelEn: 'Documentary training',
        href: '/services/formation'
      },
    ],
  },
  {
    labelFr: 'Ressources',
    labelEn: 'Resources',
    icon: <Globe size={18} />,
    children: [
      {
        labelFr: 'Livres électroniques',
        labelEn: 'E-books',
        href: '/livres-numeriques'
      },
      {
        labelFr: 'Catalogue OPAC',
        labelEn: 'OPAC catalog',
        href: '/catalogue'
      },
      {
        labelFr: 'Thèses & Mémoires',
        labelEn: 'Theses & Dissertations',
        href: '/archives'
      },
      {
        labelFr: 'E-Ressources',
        labelEn: 'E-resources',
        href: '/ressources/electroniques'
      },
      {
        labelFr: 'Ressources par discipline',
        labelEn: 'Resources by discipline',
        href: '/E_ressources'
      },
      {
        labelFr: 'Périodiques électroniques',
        labelEn: 'Electronic journals',
        href: '/periodiques'
      },
      {
        labelFr: 'Open Access',
        labelEn: 'Open Access',
        href: '/open-access'
      },
    ],
  },
  {
    labelFr: 'Dépôt',
    labelEn: 'Deposit',
    icon: <FileText size={18} />,
    children: [
      {
        labelFr: 'Déposer un mémoire',
        labelEn: 'Submit a dissertation',
        href: '/depot/soumettre'
      },
      {
        labelFr: 'Répertoire thèses',
        labelEn: 'Thesis directory',
        href: '/archives'
      },
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

  /* =========================
     RESPONSIVE
  ========================= */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /* =========================
     SCROLL
  ========================= */

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handler);

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, []);

  /* =========================
     ROUTE CHANGE
  ========================= */

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /* =========================
     CLICK OUTSIDE
  ========================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* =========================
     DROPDOWN
  ========================= */

  const handleMouseEnter = (label) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }

    setHoveredItem(label);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredItem(null);
    }, 300);

    setDropdownTimeout(timeout);
  };

  /* =========================
     SEARCH
  ========================= */

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQ.trim()) return;

    navigate(
      `/catalogue?q=${encodeURIComponent(searchQ.trim())}`
    );

    setSearchOpen(false);
    setSearchQ('');

    if (onSearch) {
      onSearch(searchQ.trim());
    }
  };

  /* =========================
     TRANSLATION
  ========================= */

  const translateLabel = (item) =>
    language === 'en'
      ? (item.labelEn || item.labelFr)
      : item.labelFr;

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    logout();

    addToast(
      language === 'en'
        ? 'Logout successful'
        : 'Déconnexion réussie',
      'success'
    );

    navigate('/');

    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  /* =========================
     MOBILE MENU
  ========================= */

  const toggleMobile = (label) => {
    setMobileExpand(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  /* =========================
     ACTIVE ROUTES
  ========================= */

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(path);
  };

  const isChildActive = (children) => {
    if (!children) return false;

    return children.some(child =>
      location.pathname.startsWith(child.href)
    );
  };

  /* =========================
     USER
  ========================= */

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield size={16} />;

    if (isAideBiblio) {
      return <BookMarked size={16} />;
    }

    if (user?.role === 'BIBLIO') {
      return <FileText size={16} />;
    }

    return <User size={16} />;
  };

  const getDashboardClass = () => {
    if (isAdmin) return 'admin';

    if (isAideBiblio) return 'aide';

    if (user?.role === 'BIBLIO') return 'staff';

    return 'user';
  };

  const getLogoLink = () => {
    if (user) {
      return getHomeRoute();
    }

    return '/';
  };

  const getUserInitial = () => {
    if (!user) return '?';

    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }

    if (user.username) {
      return user.username[0].toUpperCase();
    }

    return '?';
  };

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className={`header ${scrolled ? 'scrolled' : ''}`}>

        <div className="container header-inner">

          {/* =========================
              LOGO
          ========================= */}

          <Link
            to={getLogoLink()}
            className="logo-link"
          >
            <img
              src={logo}
              alt="BCUYI - Bibliothèque Centrale Universitaire"
              className="logo-img"
            />

            <div className="logo-text">
              <span className="logo-text-main">
                BC<span>UYI</span>
              </span>

              <span className="logo-text-sub">
                BIBLIOTHÈQUE CENTRALE
              </span>
            </div>
          </Link>

          {/* =========================
              DESKTOP NAVIGATION
          ========================= */}

          <nav
            className="desktop-nav"
            role="navigation"
            aria-label="Navigation principale"
          >
            <ul className="nav-list">

              {NAV.map((item) => (
                <li
                  key={item.labelFr}
                  className="nav-item"
                  onMouseEnter={() =>
                    item.children &&
                    handleMouseEnter(item.labelFr)
                  }
                  onMouseLeave={handleMouseLeave}
                >

                  {item.href ? (

                    <Link
                      to={item.href}
                      className={`nav-link ${
                        isActive(item.href)
                          ? 'active'
                          : ''
                      }`}
                    >
                      {item.icon}
                      {translateLabel(item)}
                    </Link>

                  ) : (

                    <>
                      <button
                        className={`nav-link ${
                          isChildActive(item.children)
                            ? 'active'
                            : ''
                        }`}
                        type="button"
                      >
                        {item.icon}

                        {translateLabel(item)}

                        <ChevronDown
                          size={14}
                          className={`dropdown-chevron ${
                            hoveredItem === item.labelFr
                              ? 'rotated'
                              : ''
                          }`}
                        />
                      </button>

                      {/* DROPDOWN */}

                      <div
                        className={`dropdown ${
                          hoveredItem === item.labelFr
                            ? 'visible'
                            : ''
                        }`}
                      >
                        <div className="dropdown-content">

                          <div className="dropdown-header">
                            {translateLabel(item)}
                          </div>

                          {item.children.map(child => (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={() =>
                                setHoveredItem(null)
                              }
                              className={`dropdown-link ${
                                isActive(child.href)
                                  ? 'active'
                                  : ''
                              }`}
                            >

                              <span>
                                {language === 'en'
                                  ? (
                                      child.labelEn ||
                                      child.labelFr
                                    )
                                  : child.labelFr}
                              </span>

                              {isActive(child.href) && (
                                <span className="dropdown-dot" />
                              )}

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

          {/* =========================
              HEADER ACTIONS
          ========================= */}

          <div className="header-actions">

            {/* SEARCH */}

            <button
              onClick={() =>
                setSearchOpen(!searchOpen)
              }
              className={`search-toggle ${
                searchOpen ? 'active' : ''
              }`}
              aria-label={
                language === 'en'
                  ? 'Search'
                  : 'Rechercher'
              }
            >
              <Search size={18} />
            </button>

            {/* LANGUAGE */}

            <div
              className="language-switcher"
              aria-label="Sélecteur de langue"
            >

              <button
                type="button"
                className={
                  language === 'fr'
                    ? 'language-option active'
                    : 'language-option'
                }
                onClick={() =>
                  setLanguage('fr')
                }
                aria-label="Français"
              >
                FR
              </button>

              <button
                type="button"
                className={
                  language === 'en'
                    ? 'language-option active'
                    : 'language-option'
                }
                onClick={() =>
                  setLanguage('en')
                }
                aria-label="English"
              >
                EN
              </button>

            </div>

            {/* USER */}

            {user ? (

              <div className="user-actions">

                <NotificationBell
                  className="notification-bell-header"
                />

                <Link
                  to="/favoris"
                  className="action-btn"
                  aria-label={t(
                    'common',
                    'favorites',
                    'Mes favoris'
                  )}
                  title={t(
                    'common',
                    'favorites',
                    'Mes favoris'
                  )}
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

                  <span className="dashboard-label">
                    {getHomeLabel()}
                  </span>

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

              <Link
                to="/connexion"
                className="btn-login"
              >
                <User size={16} />

                {t(
                  'common',
                  'login',
                  'Connexion'
                )}
              </Link>

            )}

            {/* MOBILE BURGER */}

            <button
              className="mobile-burger"
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

          </div>
        </div>

        {/* =====================================================
            SEARCH OVERLAY
        ===================================================== */}

        {searchOpen && (

          <div
            className="search-overlay"
            ref={searchRef}
          >

            <div className="search-container">

              <form
                onSubmit={handleSearch}
                className="search-form"
              >

                <Search
                  size={20}
                  className="search-icon"
                />

                <input
                  autoFocus
                  value={searchQ}
                  onChange={e =>
                    setSearchQ(e.target.value)
                  }
                  placeholder={
                    language === 'en'
                      ? 'Title, author, ISBN, subject…'
                      : 'Titre, auteur, ISBN, sujet…'
                  }
                  className="search-input"
                />

                <button
                  type="submit"
                  className="search-submit"
                >
                  {t(
                    'common',
                    'search',
                    'Rechercher'
                  )}
                </button>

              </form>

            </div>

          </div>
        )}

      </header>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}

      {mobileOpen && (

        <div className="mobile-drawer">

          <div
            className="mobile-drawer-overlay"
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <div className="mobile-drawer-panel">

            {/* DRAWER HEADER */}

            <div className="drawer-header">

              <span className="drawer-logo">
                BCU <span>UYI</span>
              </span>

              <button
                onClick={() =>
                  setMobileOpen(false)
                }
                className="drawer-close"
              >
                <X size={22} />
              </button>

            </div>

            {/* USER */}

            {user && (

              <div className="drawer-user">

                <div className="drawer-user-avatar">
                  {getUserInitial()}
                </div>

                <div className="drawer-user-info">

                  <div className="drawer-user-name">
                    {user.first_name
                      ? `${user.first_name} ${
                          user.last_name || ''
                        }`
                      : user.username}
                  </div>

                  <div className="drawer-user-email">
                    {user.email}
                  </div>

                  <div
                    className={`drawer-user-role ${
                      isStaff ? 'staff' : ''
                    }`}
                  >
                    {getRoleDisplay()}
                  </div>

                </div>

                {isStaff && (
                  <div className="drawer-user-badge">
                    Staff
                  </div>
                )}

                <div className="drawer-notification-mobile">
                  <NotificationBell />
                </div>

              </div>
            )}

            {/* LANGUAGE MOBILE */}

            <div className="drawer-language-switcher">

              <span className="drawer-language-label">
                {language === 'en'
                  ? 'Language'
                  : 'Langue'}
              </span>

              <div className="language-switcher">

                <button
                  type="button"
                  className={
                    language === 'fr'
                      ? 'language-option active'
                      : 'language-option'
                  }
                  onClick={() =>
                    setLanguage('fr')
                  }
                >
                  FR
                </button>

                <button
                  type="button"
                  className={
                    language === 'en'
                      ? 'language-option active'
                      : 'language-option'
                  }
                  onClick={() =>
                    setLanguage('en')
                  }
                >
                  EN
                </button>

              </div>

            </div>

            {/* MOBILE SEARCH */}

            <form
              onSubmit={handleSearch}
              className="drawer-search"
            >

              <input
                value={searchQ}
                onChange={e =>
                  setSearchQ(e.target.value)
                }
                placeholder={
                  language === 'en'
                    ? 'Search…'
                    : 'Rechercher…'
                }
                className="drawer-search-input"
              />

              <button
                type="submit"
                className="drawer-search-btn"
              >
                <Search size={18} />
              </button>

            </form>

            {/* MOBILE NAVIGATION */}

            <nav className="drawer-nav">

              {NAV.map((item) => {

                const isActiveLink = item.href
                  ? isActive(item.href)
                  : false;

                return (

                  <div key={item.labelFr}>

                    {item.href ? (

                      <Link
                        to={item.href}
                        className={`drawer-link ${
                          isActiveLink
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                      >

                        {item.icon}

                        {translateLabel(item)}

                        {isActiveLink && (
                          <span className="drawer-link-dot" />
                        )}

                      </Link>

                    ) : (

                      <>

                        <button
                          onClick={() =>
                            toggleMobile(item.labelFr)
                          }
                          className="drawer-link drawer-link-parent"
                          type="button"
                        >

                          <span className="drawer-link-content">

                            {item.icon}

                            {translateLabel(item)}

                          </span>

                          <ChevronDown
                            size={16}
                            className={`drawer-chevron ${
                              mobileExpand[item.labelFr]
                                ? 'rotated'
                                : ''
                            }`}
                          />

                        </button>

                        {mobileExpand[item.labelFr] && (

                          <div className="drawer-submenu">

                            {item.children.map(child => (

                              <Link
                                key={child.href}
                                to={child.href}
                                className={`drawer-sub-link ${
                                  isActive(child.href)
                                    ? 'active'
                                    : ''
                                }`}
                                onClick={() =>
                                  setMobileOpen(false)
                                }
                              >

                                <span>
                                  {language === 'en'
                                    ? (
                                        child.labelEn ||
                                        child.labelFr
                                      )
                                    : child.labelFr}
                                </span>

                                {isActive(child.href) && (
                                  <span className="drawer-link-dot" />
                                )}

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

            {/* DRAWER FOOTER */}

            <div className="drawer-footer">

              {user ? (

                <>

                  <Link
                    to={getHomeRoute()}
                    className="drawer-footer-btn primary"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    {getDashboardIcon()}
                    {getHomeLabel()}
                  </Link>

                  <Link
                    to="/favoris"
                    className="drawer-footer-btn secondary"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    <Heart size={16} />

                    {t(
                      'common',
                      'favorites',
                      'Mes favoris'
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="drawer-footer-btn logout"
                  >
                    <LogOut size={16} />

                    {t(
                      'common',
                      'logout',
                      'Se déconnecter'
                    )}
                  </button>

                </>

              ) : (

                <>

                  <Link
                    to="/connexion"
                    className="drawer-footer-btn primary"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    <User size={16} />

                    {t(
                      'common',
                      'login',
                      'Connexion'
                    )}
                  </Link>

                  <Link
                    to="/contact"
                    className="drawer-footer-btn secondary"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    {t(
                      'common',
                      'contact',
                      'Contact'
                    )}
                  </Link>

                </>

              )}

            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          STYLES
      ========================================================= */}

      <style>{`

        /* =====================================================
           VARIABLES VISUELLES
        ===================================================== */

        :root {
          --header-purple: #7C3AED;
          --header-purple-dark: #6D28D9;
          --header-purple-light: #8B5CF6;
          --header-purple-soft: #DDD6FE;
          --header-white: #FFFFFF;
        }

        /* =====================================================
           LANGUAGE SWITCHER
        ===================================================== */

        .language-switcher {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 3px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }

        .language-option {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          font-weight: 700;
          font-size: 10px;
          padding: 5px 8px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .language-option:hover {
          color: white;
          background: rgba(255, 255, 255, 0.10);
        }

        .language-option.active {
          background: white;
          color: var(--header-purple);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--header-purple);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.3s ease;
        }

        .header.scrolled {
          background: var(--header-purple-dark);
          box-shadow: 0 8px 30px rgba(76, 29, 149, 0.28);
        }

        /* =====================================================
           HEADER INNER
        ===================================================== */

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

        /* =====================================================
           LOGO
        ===================================================== */

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
          color: white;
        }

        .logo-text-main span {
          color: var(--header-purple-soft);
        }

        .logo-text-sub {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.70);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        /* =====================================================
           DESKTOP NAVIGATION
        ===================================================== */

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
          color: rgba(255, 255, 255, 0.90);
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
          background: white;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 50%;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .nav-link.active {
          color: white;
          font-weight: 600;
        }

        .dropdown-chevron {
          transition: transform 0.3s ease;
        }

        .dropdown-chevron.rotated {
          transform: rotate(180deg);
        }

        /* =====================================================
           DROPDOWN
        ===================================================== */

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
          transition:
            opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.2s;
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
          background: #F5F3FF;
          color: var(--header-purple);
        }

        .dropdown-link.active {
          background: rgba(124, 58, 237, 0.08);
          color: var(--header-purple);
          font-weight: 600;
        }

        .dropdown-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--header-purple);
          flex-shrink: 0;
        }

        /* =====================================================
           HEADER ACTIONS
        ===================================================== */

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* =====================================================
           SEARCH BUTTON
        ===================================================== */

        .search-toggle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.90);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .search-toggle:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .search-toggle.active {
          background: white;
          color: var(--header-purple);
        }

        /* =====================================================
           USER ACTIONS
        ===================================================== */

        .user-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 6px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.14);
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
          color: rgba(255, 255, 255, 0.80);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        /* =====================================================
           NOTIFICATION
        ===================================================== */

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
          color: rgba(255, 255, 255, 0.85) !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }

        .notification-bell-header .notification-bell-btn:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          color: white !important;
        }

        .notification-bell-header .notification-bell-btn svg {
          width: 18px !important;
          height: 18px !important;
        }

        .notification-bell-header .notification-badge {
          background: #F43F5E !important;
          border: 2px solid var(--header-purple) !important;
          font-size: 8px !important;
          min-width: 16px !important;
          height: 16px !important;
          transform: translate(4px, -4px) !important;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.3) !important;
        }

        .notification-bell-header .notification-dot {
          background: #F43F5E !important;
          border: 2px solid var(--header-purple) !important;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.3) !important;
        }

        /* =====================================================
           DASHBOARD BUTTON
        ===================================================== */

        .dashboard-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 12px 3px 3px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          text-decoration: none;
          transition: all 0.25s ease;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.10);
          white-space: nowrap;
        }

        .dashboard-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.16);
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
          color: var(--header-purple);
          background: white;
          flex-shrink: 0;
        }

        .dashboard-label {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .dashboard-btn.admin {
          background: #4C1D95;
          color: white;
          border-color: rgba(255, 255, 255, 0.20);
        }

        .dashboard-btn.admin .dashboard-avatar {
          background: white;
          color: #4C1D95;
        }

        .dashboard-btn.staff {
          background: #8B5CF6;
          color: white;
          border-color: rgba(255, 255, 255, 0.20);
        }

        .dashboard-btn.staff .dashboard-avatar {
          background: white;
          color: #7C3AED;
        }

        .dashboard-btn.aide {
          background: #A78BFA;
          color: white;
          border-color: rgba(255, 255, 255, 0.20);
        }

        .dashboard-btn.aide .dashboard-avatar {
          background: white;
          color: #7C3AED;
        }

        .dashboard-btn.user {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border-color: rgba(255, 255, 255, 0.16);
        }

        .dashboard-btn.user .dashboard-avatar {
          background: white;
          color: #7C3AED;
        }

        /* =====================================================
           LOGOUT
        ===================================================== */

        .logout-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.80);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.18);
          color: #FCA5A5;
        }

        /* =====================================================
           LOGIN
        ===================================================== */

        .btn-login {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 50px;
          background: white;
          color: var(--header-purple);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .btn-login:hover {
          background: #F5F3FF;
          color: var(--header-purple-dark);
          transform: scale(1.04);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        }

        /* =====================================================
           MOBILE BURGER
        ===================================================== */

        .mobile-burger {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
          flex-shrink: 0;
        }

        .mobile-burger:hover {
          background: rgba(255, 255, 255, 0.20);
          border-color: rgba(255, 255, 255, 0.35);
        }

        /* =====================================================
           SEARCH OVERLAY
        ===================================================== */

        .search-overlay {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 12px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10);
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
          background: #F5F3FF;
          border-radius: 10px;
          padding: 3px 3px 3px 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: border-color 0.2s ease;
        }

        .search-form:focus-within {
          border-color: var(--header-purple);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        .search-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          padding: 8px 0;
          border: none;
          background: transparent;
          font-size: 14px;
          font-family: inherit;
          color: #1e293b;
          outline: none;
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        .search-submit {
          padding: 8px 20px;
          border: none;
          border-radius: 8px;
          background: var(--header-purple);
          color: white;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          flex-shrink: 0;
        }

        .search-submit:hover {
          background: var(--header-purple-dark);
        }

        /* =====================================================
           MOBILE DRAWER
        ===================================================== */

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

        /* =====================================================
           DRAWER HEADER
        ===================================================== */

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
          color: #1B1464;
        }

        .drawer-logo span {
          color: var(--header-purple);
        }

        .drawer-close {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F5F3FF;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .drawer-close:hover {
          background: #EDE9FE;
          color: var(--header-purple);
        }

        /* =====================================================
           DRAWER USER
        ===================================================== */

        .drawer-user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: #F5F3FF;
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
          background: var(--header-purple);
          flex-shrink: 0;
        }

        .drawer-user-info {
          flex: 1;
        }

        .drawer-user-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
        }

        .drawer-user-email {
          font-size: 12px;
          color: #64748b;
        }

        .drawer-user-role {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }

        .drawer-user-role.staff {
          color: var(--header-purple);
        }

        .drawer-user-badge {
          padding: 2px 10px;
          border-radius: 50px;
          background: var(--header-purple);
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
          color: #64748b !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }

        /* =====================================================
           DRAWER SEARCH
        ===================================================== */

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
          color: #1e293b;
          background: #F5F3FF;
        }

        .drawer-search-input:focus {
          border-color: var(--header-purple);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        .drawer-search-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          background: var(--header-purple);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drawer-search-btn:hover {
          background: var(--header-purple-dark);
        }

        /* =====================================================
           DRAWER LANGUAGE
        ===================================================== */

        .drawer-language-switcher {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #F5F3FF;
          border-radius: 10px;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .drawer-language-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
        }

        .drawer-language-switcher .language-switcher {
          background: #EDE9FE;
          border-color: rgba(124, 58, 237, 0.10);
        }

        .drawer-language-switcher .language-option {
          color: #64748b;
        }

        .drawer-language-switcher .language-option:hover {
          color: var(--header-purple);
          background: rgba(124, 58, 237, 0.08);
        }

        .drawer-language-switcher .language-option.active {
          background: var(--header-purple);
          color: white;
        }

        /* =====================================================
           DRAWER NAV
        ===================================================== */

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
          color: #1e293b;
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
          background: none;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          text-align: left;
        }

        .drawer-link.active {
          color: var(--header-purple);
          font-weight: 700;
        }

        .drawer-link:hover {
          color: var(--header-purple);
        }

        .drawer-link-dot {
          margin-left: auto;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--header-purple);
          flex-shrink: 0;
        }

        .drawer-link-parent {
          justify-content: space-between;
          border: none;
        }

        .drawer-link-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .drawer-chevron {
          transition: transform 0.3s ease;
          color: #64748b;
        }

        .drawer-chevron.rotated {
          transform: rotate(180deg);
        }

        .drawer-submenu {
          padding-left: 44px;
          padding-bottom: 8px;
          background: #F5F3FF;
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
          color: #64748b;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .drawer-sub-link:hover {
          background: white;
          color: var(--header-purple);
        }

        .drawer-sub-link.active {
          color: var(--header-purple);
          font-weight: 600;
        }

        /* =====================================================
           DRAWER FOOTER
        ===================================================== */

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
          background: var(--header-purple);
          color: white;
        }

        .drawer-footer-btn.primary:hover {
          background: var(--header-purple-dark);
        }

        .drawer-footer-btn.secondary {
          background: transparent;
          color: #1e293b;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .drawer-footer-btn.secondary:hover {
          border-color: var(--header-purple);
          color: var(--header-purple);
        }

        .drawer-footer-btn.logout {
          background: transparent;
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .drawer-footer-btn.logout:hover {
          background: rgba(239, 68, 68, 0.06);
          border-color: #ef4444;
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown {
          animation: dropdownFade 0.25s ease;
        }

        /* =====================================================
           DESKTOP ≥ 993px
        ===================================================== */

        @media (min-width: 993px) {

          .mobile-burger {
            display: none !important;
          }

          .drawer-notification-mobile {
            display: none !important;
          }

          .drawer-language-switcher {
            display: none !important;
          }

          .user-actions .action-btn,
          .user-actions .dashboard-btn,
          .user-actions .logout-btn {
            display: flex !important;
          }

          .desktop-nav {
            display: flex !important;
          }

          .language-switcher {
            display: inline-flex !important;
          }
        }

        /* =====================================================
           TABLET / MOBILE ≤ 992px
        ===================================================== */

        @media (max-width: 992px) {

          .desktop-nav {
            display: none !important;
          }

          .mobile-burger {
            display: flex !important;
          }

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

          .language-switcher {
            display: inline-flex !important;
            padding: 2px;
          }

          .language-option {
            font-size: 9px;
            padding: 4px 7px;
            min-width: 28px;
          }

          .header-inner {
            height: 64px;
            padding: 0 12px;
          }

          .logo-text-main {
            font-size: 17px;
          }

          .logo-text-sub {
            font-size: 7px;
          }

          .logo-img {
            width: 36px;
            height: 36px;
          }

          .search-toggle {
            width: 36px;
            height: 36px;
          }

          .search-toggle svg {
            width: 16px;
            height: 16px;
          }

          .btn-login {
            padding: 6px 14px;
            font-size: 12px;
          }
        }

        /* =====================================================
           SMALL MOBILE ≤ 480px
        ===================================================== */

        @media (max-width: 480px) {

          .logo-text {
            display: none;
          }

          .logo-img {
            width: 32px;
            height: 32px;
          }

          .header-inner {
            height: 56px;
            padding: 0 10px;
          }

          .mobile-burger {
            width: 34px;
            height: 34px;
          }

          .mobile-burger svg {
            width: 18px;
            height: 18px;
          }

          .mobile-drawer-panel {
            padding: 16px 18px;
            width: 300px;
          }

          .drawer-user {
            padding: 12px 14px;
          }

          .drawer-user-avatar {
            width: 38px;
            height: 38px;
            font-size: 14px;
          }

          .drawer-user-name {
            font-size: 14px;
          }

          .drawer-link {
            font-size: 13px;
            padding: 10px 0;
          }

          .drawer-submenu {
            padding-left: 36px;
          }

          .drawer-footer-btn {
            font-size: 13px;
            padding: 10px;
          }

          .search-toggle {
            width: 32px;
            height: 32px;
          }

          .search-toggle svg {
            width: 14px;
            height: 14px;
          }

          .language-switcher {
            display: inline-flex !important;
            padding: 2px;
          }

          .language-option {
            font-size: 8px;
            padding: 3px 6px;
            min-width: 24px;
          }

          .header-actions {
            gap: 4px;
          }

          .btn-login {
            padding: 5px 10px;
            font-size: 11px;
          }

          .btn-login svg {
            width: 14px;
            height: 14px;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE ≤ 360px
        ===================================================== */

        @media (max-width: 360px) {

          .mobile-drawer-panel {
            padding: 12px 14px;
            width: 280px;
          }

          .drawer-link {
            font-size: 12px;
            padding: 8px 0;
          }

          .drawer-submenu {
            padding-left: 30px;
          }

          .language-option {
            font-size: 8px;
            padding: 3px 5px;
            min-width: 22px;
          }

          .header-inner {
            padding: 0 8px;
            gap: 4px;
          }
        }

        /* =====================================================
           SCROLLBARS
        ===================================================== */

        .mobile-drawer-panel::-webkit-scrollbar {
          width: 4px;
        }

        .mobile-drawer-panel::-webkit-scrollbar-track {
          background: #F5F3FF;
        }

        .mobile-drawer-panel::-webkit-scrollbar-thumb {
          background: var(--header-purple);
          border-radius: 2px;
        }

        .drawer-nav::-webkit-scrollbar {
          width: 3px;
        }

        .drawer-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .drawer-nav::-webkit-scrollbar-thumb {
          background: var(--header-purple);
          border-radius: 2px;
        }

      `}</style>
    </>
  );
}
