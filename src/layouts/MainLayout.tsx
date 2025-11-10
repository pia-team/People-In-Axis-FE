import React, { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  CircularProgress,
  Collapse,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  Receipt,
  Settings,
  ExpandLess,
  ExpandMore,
  Notifications,
  AccountCircle,
  Logout,
  Person,
  Brightness4,
  Brightness7,
  AccessTime,
  ListAlt,
  AssignmentInd,
  AssignmentTurnedIn,
  AdminPanelSettings,
  UploadFile,
  ReceiptLong,
  FactCheck,
  Group,
  GroupAdd,
  Inventory2,
  Folder,
  BarChart,
  QueryStats,
  InsertChartOutlined,
  History,
  BusinessCenter,
  RequestQuote,
  ManageAccounts,
  Share,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { useKeycloak } from '@/hooks/useKeycloak';
import { useQuery } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { languageService } from '@/services/languageService';
import { apiClient } from '@/services/api';

const drawerWidth = 280;

interface MenuItemType {
  title: string;
  path?: string;
  icon: React.ReactElement;
  children?: MenuItemType[];
  roles?: string[];
  isModule?: boolean;
}

const menuItems: MenuItemType[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: 'Employees',
    icon: <People />,
    roles: ['HUMAN_RESOURCES', 'ADMIN'],
    children: [
      { title: 'All Employees', path: '/employees', icon: <Group /> },
      { title: 'My Profile', path: '/profile', icon: <Person /> },
    ],
  },
  {
    title: 'Companies',
    path: '/companies',
    icon: <Business />,
    roles: ['COMPANY_MANAGER', 'ADMIN'],
  },
  {
    title: 'Time Management',
    icon: <AccessTime />,
    children: [
      { title: 'My Timesheets', path: '/timesheets/my', icon: <ListAlt /> },
      { title: 'All Timesheets', path: '/timesheets', icon: <AssignmentInd />, roles: ['TEAM_MANAGER', 'HUMAN_RESOURCES'] },
      { title: 'Assigned Rows', path: '/timesheets/assigned', icon: <AssignmentTurnedIn />, roles: ['TEAM_MANAGER'] },
      { title: 'Approval', path: '/timesheets/approval', icon: <FactCheck />, roles: ['TEAM_MANAGER', 'HUMAN_RESOURCES'] },
      { title: 'Admin Approval', path: '/timesheets/admin-approval', icon: <AdminPanelSettings />, roles: ['ADMIN'] },
      { title: 'Import Timesheets', path: '/timesheets/import', icon: <UploadFile />, roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER'] },
    ],
  },
  {
    title: 'Expenses',
    icon: <ReceiptLong />,
    children: [
      { title: 'My Expenses', path: '/expenses/my', icon: <Receipt /> },
      { title: 'All Expenses', path: '/expenses', icon: <RequestQuote />, roles: ['TEAM_MANAGER', 'HUMAN_RESOURCES', 'FINANCE'] },
      { title: 'Approval', path: '/expenses/approval', icon: <FactCheck />, roles: ['TEAM_MANAGER', 'HUMAN_RESOURCES', 'FINANCE'] },
    ],
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: <Folder />,
  },
  {
    title: 'CV Sharing',
    icon: <Share />,
    isModule: true,
    children: [
      { title: 'Positions', path: '/cv-sharing/positions', icon: <BusinessCenter />, roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER'] },
      { title: 'Applications', path: '/cv-sharing/applications', icon: <GroupAdd /> },
      { title: 'Pool CVs', path: '/cv-sharing/pool-cvs', icon: <Inventory2 /> },
    ],
  },
  {
    title: 'Reports',
    icon: <BarChart />,
    roles: ['HUMAN_RESOURCES', 'ADMIN', 'COMPANY_MANAGER'],
    children: [
      { title: 'Timesheet Report', path: '/reports/timesheet', icon: <QueryStats /> },
      { title: 'Expense Report', path: '/reports/expense', icon: <InsertChartOutlined /> },
      { title: 'Audit Logs', path: '/reports/logs', icon: <History /> },
    ],
  },
  {
    title: 'Admin',
    icon: <Settings />,
    roles: ['ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { title: 'Users', path: '/admin/users', icon: <ManageAccounts /> },
      { title: 'Roles', path: '/admin/roles', icon: <Settings /> },
      { title: 'Settings', path: '/admin/settings', icon: <Settings /> },
    ],
  },
  {
    title: 'Settings',
    icon: <Settings />,
    children: [
      { title: 'Languages', path: '/settings/languages', icon: <LanguageIcon /> },
    ],
  },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { tokenParsed, logout, hasAnyRole } = useKeycloak();
  const { i18n } = useTranslation();
  const showManagerCounts = hasAnyRole(['TEAM_MANAGER', 'HUMAN_RESOURCES']);
  const { data: managerPendingCount } = useQuery({
    queryKey: ['timesheets', 'manager-pending', 'count'],
    queryFn: timeSheetService.getManagerPendingCount,
    enabled: showManagerCounts,
  });
  const showAdminCounts = hasAnyRole(['ADMIN']);
  const { data: adminPendingCount } = useQuery({
    queryKey: ['timesheets', 'admin-pending', 'count'],
    queryFn: timeSheetService.getAdminPendingCount,
    enabled: showAdminCounts,
  });
  const showTeamLeadCounts = hasAnyRole(['TEAM_MANAGER']);
  const { data: teamLeadAssignedCount } = useQuery({
    queryKey: ['timesheets', 'teamlead-assigned', 'count'],
    queryFn: timeSheetService.getTeamLeadAssignedCount,
    enabled: showTeamLeadCounts,
  });
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [langLoading, setLangLoading] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { data: activeLangs } = useQuery({
    queryKey: ['languages', 'active'],
    queryFn: languageService.getActive,
    staleTime: 60_000,
  });

  // Register i18n bundles for active languages when loaded
  useEffect(() => {
    if (!activeLangs || activeLangs.length === 0) return;
    const enBundle = (i18n.getResourceBundle('en', 'translation') as any) ?? {};
    activeLangs.forEach(({ code }) => {
      const lc = (code || '').toLowerCase() || 'en';
      const has = i18n.hasResourceBundle(lc, 'translation');
      if (!has) {
        i18n.addResourceBundle(lc, 'translation', enBundle, true, true);
      }
    });
    const saved = (localStorage.getItem('lang') || 'en').toLowerCase();
    if (activeLangs.some(l => (l.code || '').toLowerCase() === saved)) {
      // Preload translations for saved language (if not 'en')
      (async () => {
        try {
          if (saved !== 'en') {
            const res = await apiClient.get<Record<string, string>>(`/translations/${encodeURIComponent(saved)}`);
            const map = res.data || {};
            if (Object.keys(map).length > 0) {
              i18n.addResourceBundle(saved, 'translation', map, true, true);
            }
          }
          i18n.changeLanguage(saved);
        } catch {
          i18n.changeLanguage(saved);
        }
      })();
    }
  }, [activeLangs, i18n]);

  const openLangMenu = (e: React.MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget);
  const closeLangMenu = () => setLangAnchor(null);
  const changeLang = async (code: string) => {
    try {
      setLangLoading(code);
      // Fetch translations map from backend and register bundle (authorized call)
      if (code && code.toLowerCase() !== 'en') {
        const res = await apiClient.get<Record<string, string>>(`/translations/${encodeURIComponent(code)}`);
        const map = res.data || {};
        if (Object.keys(map).length > 0) {
          i18n.addResourceBundle(code, 'translation', map, true, true);
        }
      }
      i18n.changeLanguage(code);
      try { localStorage.setItem('lang', code); } catch {}
    } catch (e) {
      // no-op; fallback still applies via i18n
      // console.error('Translation fetch failed', e);
    } finally {
      setLangLoading(null);
      closeLangMenu();
    }
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const canViewMenuItem = (item: MenuItemType): boolean => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return hasAnyRole(item.roles);
  };

  const isItemSelected = (item: MenuItemType): boolean => {
    if (item.path) {
      return location.pathname.startsWith(item.path);
    }
    if (item.children && item.children.length > 0) {
      return item.children.some((c) => c.path && location.pathname.startsWith(c.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItemType, level: number = 0) => {
    if (!canViewMenuItem(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isModule = item.isModule && level === 0;

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            selected={isItemSelected(item)}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(item.title);
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            sx={
              isModule
                ? {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 1,
                    borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                    my: 0.5,
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    },
                    '&.Mui-selected': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                      borderLeft: (theme) => `4px solid ${theme.palette.primary.dark}`,
                    },
                  }
                : undefined
            }
          >
            <ListItemIcon sx={isModule ? { color: 'primary.main' } : undefined}>
              {isModule ? (
                <Badge badgeContent="MODULE" color="primary" sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: '0.6rem', 
                    height: 16,
                    minWidth: 16,
                    right: -8,
                    top: -8
                  } 
                }}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={(() => {
                if (item.title === 'Approval' && typeof managerPendingCount === 'number' && managerPendingCount > 0) {
                  return `${item.title} (${managerPendingCount})`;
                }
                if (item.title === 'Assigned Rows' && typeof teamLeadAssignedCount === 'number' && teamLeadAssignedCount > 0) {
                  return `${item.title} (${teamLeadAssignedCount})`;
                }
                if (item.title === 'Admin Approval' && typeof adminPendingCount === 'number' && adminPendingCount > 0) {
                  return `${item.title} (${adminPendingCount})`;
                }
                return item.title;
              })()}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List
              component="div"
              disablePadding
              sx={isModule ? { 
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                borderLeft: (theme) => `2px solid ${theme.palette.primary.main}`,
                ml: 2
              } : undefined}
            >
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const menuItemsOrdered = useMemo(() => {
    const regularItems = menuItems.filter(item => !item.isModule);
    const moduleItems = menuItems.filter(item => item.isModule);
    return { regular: regularItems, modules: moduleItems };
  }, []);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          People In Axis
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItemsOrdered.regular.map((item) => renderMenuItem(item))}
        </List>
        {menuItemsOrdered.modules.length > 0 && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                Modules
              </Typography>
            </Box>
            <List>
              {menuItemsOrdered.modules.map((item) => renderMenuItem(item))}
            </List>
          </>
        )}
      </Box>
    </Box>
  );

  const { mode, toggle } = useThemeMode();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${sidebarOpen ? drawerWidth : 0}px` },
          transition: 'all 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Dynamic page title can go here */}
          </Typography>
          <IconButton size="large" color="inherit" onClick={toggle} sx={{ mr: 1 }} aria-label="Toggle theme">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
          <IconButton size="large" color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton size="large" color="inherit" onClick={openLangMenu} aria-label="Change language" sx={{ ml: 0.5 }}>
            <LanguageIcon />
          </IconButton>
          <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={closeLangMenu}>
            {(activeLangs ?? [{ code: 'en', name: 'English' }]).map(l => (
              <MenuItem key={l.code} selected={i18n.language === l.code} onClick={() => changeLang(l.code)}>
                <ListItemText>{l.name} ({l.code})</ListItemText>
                {langLoading === l.code && (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                )}
              </MenuItem>
            ))}
          </Menu>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {tokenParsed?.given_name?.[0] || <AccountCircle />}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: sidebarOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: sidebarOpen ? 0 : 0 },
          transition: 'all 0.3s',
          mt: 8,
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
