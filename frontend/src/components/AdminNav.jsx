import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Package, Award, FileText, Star, Users, LayoutDashboard } from 'lucide-react';

const AdminNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      label: 'Manage Orders',
      path: '/admin/orders',
      icon: <ShoppingBag size={16} />,
    },
    {
      label: 'Manage Products',
      path: '/admin/products',
      icon: <Package size={16} />,
    },
    {
      label: 'Manage Homepage Products',
      path: '/admin/featured',
      icon: <Award size={16} />,
    },
    {
      label: 'Manage Blog',
      path: '/admin/blog',
      icon: <FileText size={16} />,
    },
    {
      label: 'Manage Testimonials',
      path: '/admin/testimonials',
      icon: <Star size={16} />,
    },
    {
      label: 'Manage User Roles',
      path: '/admin/roles',
      icon: <Users size={16} />,
    },
    {
      label: 'Dashboard Overview',
      path: '/admin',
      icon: <LayoutDashboard size={16} />,
    },
  ];

  return (
    <div className="mb-10 w-full">
      <div className="glass-card p-2 bg-white/70 backdrop-blur-md rounded-2xl border border-accent/20 shadow-sm overflow-x-auto flex flex-row items-center gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-primary/60 hover:text-primary hover:bg-accent/40'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminNav;
