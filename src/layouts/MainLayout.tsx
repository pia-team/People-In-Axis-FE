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
  Collapse,
  Container,
  useMediaQuery,
  useTheme,
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
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { useKeycloak } from '@/hooks/useKeycloak';
import { useQuery } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import { notificationService } from '@/services/notificationService';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const drawerWidth = 280;

interface MenuItemType {
  title: string;
  path?: string;
  icon: React.ReactElement;
  children?: MenuItemType[];
  roles?: string[];
  isModule?: boolean;
}

const getMenuItems = (t: (key: string) => string): MenuItemType[] => [
  {
    title: t('navigation.dashboard'),
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: t('navigation.employees'),
    icon: <People />,
    roles: ['HUMAN_RESOURCES'],
    children: [
      { title: t('navigation.allEmployees'), path: '/employees', icon: <Group /> },
      { title: t('navigation.myProfile'), path: '/profile', icon: <Person /> },
    ],
  },
  {
    title: t('navigation.companies'),
    path: '/companies',
    icon: <Business />,
    roles: ['COMPANY_MANAGER', 'ADMIN'],
  },
  {
    title: t('navigation.timeManagement'),
    icon: <AccessTime />,
    isModule: true,
    roles: ['COMPANY_MANAGER', 'HUMAN_RESOURCES','MANAGER'],
    children: [
      { title: t('navigation.myTimesheets'), path: '/timesheets/my', icon: <ListAlt /> },
      { title: t('navigation.allTimesheets'), path: '/timesheets', icon: <AssignmentInd />, roles: ['MANAGER', 'HUMAN_RESOURCES'] },
      { title: t('navigation.assignedRows'), path: '/timesheets/assigned', icon: <AssignmentTurnedIn />, roles: ['MANAGER'] },
      { title: t('navigation.approval'), path: '/timesheets/approval', icon: <FactCheck />, roles: ['MANAGER', 'HUMAN_RESOURCES'] },
      { title: t('navigation.adminApproval'), path: '/timesheets/admin-approval', icon: <AdminPanelSettings />, roles: ['ADMIN'] },
      { title: t('navigation.importTimesheets'), path: '/timesheets/import', icon: <UploadFile />, roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER'] },
    ],
  },
  {
    title: t('navigation.expenses'),
    icon: <ReceiptLong />,
    roles: ['COMPANY_MANAGER', 'HUMAN_RESOURCES','MANAGER'],
    children: [
      { title: t('navigation.myExpenses'), path: '/expenses/my', icon: <Receipt /> },
      { title: t('navigation.allExpenses'), path: '/expenses', icon: <RequestQuote />, roles: ['MANAGER', 'HUMAN_RESOURCES' ] },
      { title: t('navigation.approval'), path: '/expenses/approval', icon: <FactCheck />, roles: ['MANAGER', 'HUMAN_RESOURCES'] },
    ],
  },
  {
    title: t('navigation.projects'),
    path: '/projects',
    icon: <Folder />,
    roles: ['HUMAN_RESOURCES','MANAGER'],
  },
  {
    title: t('navigation.cvSharing'),
    icon: <Share />,
    isModule: true,
    roles: ['COMPANY_MANAGER', 'HUMAN_RESOURCES','MANAGER'],
    children: [
      {
        title: t('navigation.positions'),
        path: '/cv-sharing/positions',
        icon: <BusinessCenter />,
        roles: ['HUMAN_RESOURCES', 'MANAGER', 'COMPANY_MANAGER','EMPLOYEE']
      },
      {
        title: t('navigation.applications'),
        path: '/cv-sharing/applications',
        icon: <GroupAdd />,
        roles: ['HUMAN_RESOURCES', 'MANAGER','EMPLOYEE']
      },
      {
        title: t('navigation.poolCVs'),
        path: '/cv-sharing/pool-cvs',
        icon: <Inventory2 />,
        roles: ['HUMAN_RESOURCES', 'MANAGER', 'COMPANY_MANAGER', 'EMPLOYEE']
      },
      {
        title: t('navigation.settings'),
        path: '/cv-sharing/settings/matching',
        icon: <Settings />,
        roles: ['HUMAN_RESOURCES','MANAGER']
      },
      {
        title: t('navigation.aiManagement'),
        icon: <QueryStats />,
        roles: ['HUMAN_RESOURCES', 'ADMIN'],
        children: [
          {
            title: t('navigation.reviewTasks'),
            path: '/cv-sharing/review-tasks',
            icon: <AssignmentInd />,
            roles: ['HUMAN_RESOURCES', 'ADMIN']
          },
          {
            title: t('navigation.training'),
            path: '/cv-sharing/training',
            icon: <QueryStats />,
            roles: ['HUMAN_RESOURCES', 'ADMIN']
          },
          {
            title: t('navigation.models'),
            path: '/cv-sharing/models',
            icon: <InsertChartOutlined />,
            roles: ['HUMAN_RESOURCES', 'ADMIN']
          },
          {
            title: t('navigation.abTests'),
            path: '/cv-sharing/ab-tests',
            icon: <BarChart />,
            roles: ['HUMAN_RESOURCES', 'ADMIN']
          },
        ]
      }
    ],
  },
  {
    title: t('navigation.reports'),
    roles: ['HUMAN_RESOURCES', 'MANAGER'],
    icon: <BarChart />,
    children: [
      { title: t('navigation.timesheetReport'), path: '/reports/timesheet', icon: <QueryStats /> },
      { title: t('navigation.expenseReport'), path: '/reports/expense', icon: <InsertChartOutlined /> },
      { title: t('navigation.auditLogs'), path: '/reports/logs', icon: <History /> },
    ],
  },
  {
    title: t('navigation.admin'),
    icon: <Settings />,
    roles: ['HUMAN_RESOURCES','MANAGER','ADMIN'],
    children: [
      { title: t('navigation.users'), path: '/admin/users', icon: <ManageAccounts /> },
      { title: t('navigation.roles'), path: '/admin/roles', icon: <Settings /> },
      { title: t('navigation.settings'), path: '/admin/settings', icon: <Settings /> },
      { title: t('navigation.auditLogs'), path: '/admin/audit-logs', icon: <History />, roles: ['ADMIN'] },
    ],
  },
];

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { tokenParsed, logout, hasAnyRole } = useKeycloak();

  // Get menu items with translations
  const menuItems = useMemo(() => getMenuItems(t), [t]);
  const showManagerCounts = hasAnyRole(['MANAGER', 'HUMAN_RESOURCES']);
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
  const showTeamLeadCounts = hasAnyRole(['MANAGER']);
  const { data: teamLeadAssignedCount } = useQuery({
    queryKey: ['timesheets', 'teamlead-assigned', 'count'],
    queryFn: timeSheetService.getTeamLeadAssignedCount,
    enabled: showTeamLeadCounts,
  });

  // Fetch unread notifications count
  // Refetch every 30 seconds to keep count updated
  const { data: unreadNotificationCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds to keep notification count up to date
    staleTime: 25000, // Consider stale after 25 seconds
    retry: 1, // Only retry once on failure
  });
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'en');

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  // Get available languages from i18n resources (statically loaded JSON files)
  const availableLangs = useMemo(() => {
    const i18nLangs = Object.keys(i18n.store.data || {});
    // Map i18n language codes to display names
    const langNames: Record<string, string> = {
      'en': 'English',
      'tr': 'Türkçe',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
      'it': 'Italiano',
      'ru': 'Русский',
      'ar': 'العربية',
      'zh': '中文',
      'ja': '日本語',
      'pt': 'Português',
      'nl': 'Nederlands',
      'pl': 'Polski',
      'ko': '한국어',
      'hi': 'हिन्दी',
    };
    return i18nLangs.map(code => ({
      code,
      name: langNames[code] || code.toUpperCase(),
    }));
  }, [i18n.store.data]);

  // Sync current language state with i18n
  useEffect(() => {
    setCurrentLang(i18n.language || 'en');

    const handleLanguageChange = () => {
      setCurrentLang(i18n.language || 'en');
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const openLangMenu = (e: React.MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget);
  const closeLangMenu = () => setLangAnchor(null);

  const changeLang = async (code: string) => {
    try {
      // Change language - this will trigger languageChanged event
      // Static files (en.json, tr.json) are loaded immediately
      // Backend translations are loaded async if static file doesn't exist
      await i18n.changeLanguage(code);
      setCurrentLang(code);

      // Trigger custom event to notify App.tsx about language change
      // This ensures the key prop in App.tsx updates and forces re-render
      window.dispatchEvent(new CustomEvent('i18n:languageChanged', { detail: { language: code } }));
    } catch (err) {
      console.error('Failed to change language:', err);
    }
    closeLangMenu();
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
                if (item.title === t('navigation.approval') && typeof managerPendingCount === 'number' && managerPendingCount > 0) {
                  return `${item.title} (${managerPendingCount})`;
                }
                if (item.title === t('navigation.assignedRows') && typeof teamLeadAssignedCount === 'number' && teamLeadAssignedCount > 0) {
                  return `${item.title} (${teamLeadAssignedCount})`;
                }
                if (item.title === t('navigation.adminApproval') && typeof adminPendingCount === 'number' && adminPendingCount > 0) {
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
                {t('common.modules')}
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
          <IconButton 
            size="large" 
            color="inherit" 
            onClick={handleNotificationMenuOpen}
            aria-label={t('notification.titlePlural')}
          >
            <Badge badgeContent={unreadNotificationCount > 0 ? unreadNotificationCount : undefined} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 320,
                maxWidth: 400,
                maxHeight: 480,
                overflow: 'auto',
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('notification.titlePlural')}
                {unreadNotificationCount > 0 && (
                  <Badge badgeContent={unreadNotificationCount} color="error" sx={{ ml: 1 }}>
                    <span style={{ width: 0, height: 0 }} />
                  </Badge>
                )}
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => { navigate('/notifications'); handleNotificationMenuClose(); }}>
              {t('notification.viewAllNotifications')}
            </MenuItem>
            {unreadNotificationCount === 0 && (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {t('notification.noNewNotifications')}
                </Typography>
              </MenuItem>
            )}
          </Menu>
          <IconButton
            size="large"
            color="inherit"
            onClick={openLangMenu}
            aria-label="Change language"
            sx={{
              ml: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <LanguageIcon />
          </IconButton>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={closeLangMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: 3,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.25,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  },
                },
              },
            }}
          >
            {(availableLangs.length > 0 ? availableLangs : [{ code: 'en', name: 'English' }]).map(l => {
              const isSelected = currentLang === l.code || i18n.language === l.code;
              return (
                <MenuItem
                  key={l.code}
                  selected={isSelected}
                  onClick={() => changeLang(l.code)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: isSelected ? 'primary.main' : 'action.hover',
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                        transition: 'all 0.2s',
                      }}
                    >
                      {l.code.toUpperCase()}
                    </Box>
                    <ListItemText
                      primary={l.name}
                      secondary={l.code.toUpperCase()}
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    />
                  </Box>
                  {isSelected && (
                    <CheckIcon
                      sx={{
                        color: 'primary.main',
                        fontSize: 20,
                        ml: 1,
                      }}
                    />
                  )}
                </MenuItem>
              );
            })}
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
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={isMobile ? () => dispatch(toggleSidebar()) : undefined}
          ModalProps={isMobile ? { keepMounted: true } : undefined}
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

// @ts-ignore
export default MainLayout;
