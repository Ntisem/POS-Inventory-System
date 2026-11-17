import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, LogOut, Moon, Search, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../ui/ConfirmModal';
import './Header.css';

const CRUMB_MAP: Record<string, string> = {
  '/': 'Overview',
  '/overview/2': 'Overview 2',
  '/overview/3': 'Overview 3',
  '/overview/4': 'Overview 4',
  '/products': 'Products',
  '/add-products': 'Add Product',
  '/categories': 'Categories',
  '/transactions': 'Transactions',
};

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pushToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const crumb = CRUMB_MAP[location.pathname] ?? 'Studio';
  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin';

  const confirmLogout = () => {
    logout();
    setLogoutOpen(false);
    pushToast({ type: 'info', title: 'Signed out', message: 'You have been logged out safely.' });
    navigate('/login');
  };

  return (
    <>
      <header className="topbar">
        <nav className="topbar__crumbs" aria-label="Breadcrumb">
          <Link to="/">Studio</Link>
          <ChevronRight size={14} />
          {location.pathname.startsWith('/add') || location.pathname.startsWith('/products') || location.pathname.startsWith('/categories') || location.pathname.startsWith('/transactions') ? (
            <>
              <span>E-Commerce</span>
              <ChevronRight size={14} />
            </>
          ) : null}
          <span className="topbar__crumb-current">{crumb}</span>
        </nav>

        <div className="topbar__actions">
          <button type="button" className="btn btn--icon btn--ghost" aria-label="Search">
            <Search size={18} />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--ghost"
            data-testid="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="btn btn--icon btn--ghost topbar__bell" aria-label="Notifications">
            <Bell size={18} />
            <span className="topbar__dot" />
          </button>
          <div className="topbar__user">
            <div className="topbar__avatar">{firstName.slice(0, 1)}</div>
            <span>Hi, {firstName}</span>
          </div>
          <button
            type="button"
            className="btn btn--icon btn--ghost"
            onClick={() => setLogoutOpen(true)}
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <ConfirmModal
        open={logoutOpen}
        variant="logout"
        title="Log out?"
        message="You will need to sign in again to manage inventory."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}
