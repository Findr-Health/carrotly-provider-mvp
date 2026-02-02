/**
 * Navigation Component with Adaptive Appointments Badge
 * Shows badge only for providers without calendar integration
 */

import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Home, Calendar, FileText, Settings } from 'lucide-react';
import { useBookingsStore } from '../store/bookingsStore';
import { useProviderData } from '../hooks/useProviderData';
import FindrLogo from './branding/FindrLogo';

export default function Navigation() {
  const location = useLocation();
  const { provider } = useProviderData();
  const { pendingCount, urgentCount, connected } = useBookingsStore();
  
  // Only show badge if provider doesn't have calendar integration
  const hasCalendarIntegration = provider?.calendar?.accessToken;
  const showBadge = !hasCalendarIntegration && pendingCount > 0;
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center">
              <FindrLogo />
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/dashboard"
                icon={Home}
                label="Dashboard"
                isActive={isActive('/dashboard')}
              />
              
              <NavLink
                to="/appointments"
                icon={Calendar}
                label="Appointments"
                isActive={isActive('/appointments')}
                badge={showBadge ? pendingCount : undefined}
                badgeUrgent={urgentCount > 0}
              />
              
              <NavLink
                to="/profile"
                icon={FileText}
                label="Profile"
                isActive={isActive('/profile') || isActive('/edit-profile')}
              />
              
              <NavLink
                to="/settings"
                icon={Settings}
                label="Settings"
                isActive={isActive('/settings')}
              />
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* WebSocket Connection Indicator */}
            {!hasCalendarIntegration && (
              <div 
                className="hidden sm:flex items-center text-xs text-gray-500"
                title={connected ? 'Real-time updates active' : 'Connecting...'}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`} />
                <span>{connected ? 'Live' : 'Connecting...'}</span>
              </div>
            )}
            
            {/* Notifications */}
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge could go here */}
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-teal-600">
                    {provider?.practiceName?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {provider?.practiceName || 'Provider'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {provider?.status || 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <MobileNavLink to="/dashboard" icon={Home} label="Home" isActive={isActive('/dashboard')} />
          <MobileNavLink 
            to="/appointments" 
            icon={Calendar} 
            label="Appointments" 
            isActive={isActive('/appointments')}
            badge={showBadge ? pendingCount : undefined}
            badgeUrgent={urgentCount > 0}
          />
          <MobileNavLink to="/profile" icon={FileText} label="Profile" isActive={isActive('/profile')} />
          <MobileNavLink to="/settings" icon={Settings} label="Settings" isActive={isActive('/settings')} />
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  badge?: number;
  badgeUrgent?: boolean;
}

function NavLink({ to, icon: Icon, label, isActive, badge, badgeUrgent }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`
        relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
        ${isActive 
          ? 'text-teal-600 bg-teal-50' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
      <span>{label}</span>
      
      {badge !== undefined && badge > 0 && (
        <Badge count={badge} urgent={badgeUrgent} />
      )}
    </Link>
  );
}

function MobileNavLink({ to, icon: Icon, label, isActive, badge, badgeUrgent }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`
        relative flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors
        ${isActive ? 'text-teal-600' : 'text-gray-600'}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-6 h-6 mb-1" aria-hidden="true" />
      <span>{label}</span>
      
      {badge !== undefined && badge > 0 && (
        <div 
          className={`
            absolute -top-1 right-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
            ${badgeUrgent ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}
            text-white
          `}
          aria-label={`${badge} pending ${badge === 1 ? 'appointment' : 'appointments'}${badgeUrgent ? ', urgent' : ''}`}
          role="status"
        >
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </Link>
  );
}

interface BadgeProps {
  count: number;
  urgent?: boolean;
}

function Badge({ count, urgent }: BadgeProps) {
  const ariaLabel = `${count} pending ${count === 1 ? 'appointment' : 'appointments'}${urgent ? ', urgent' : ''}`;
  
  return (
    <span
      className={`
        absolute -top-1 -right-1 px-2 py-0.5 text-xs font-bold rounded-full
        ${urgent 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-yellow-500 text-gray-900'
        }
      `}
      aria-label={ariaLabel}
      role="status"
    >
      {count > 99 ? '99+' : count}
      {urgent && <span className="sr-only">Urgent</span>}
    </span>
  );
}
