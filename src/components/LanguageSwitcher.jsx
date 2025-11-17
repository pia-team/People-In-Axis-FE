import React from 'react';
import { Menu, MenuItem, IconButton, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import i18n from '@/i18n';

export default function LanguageSwitcher() {
  const [anchor, setAnchor] = React.useState(null);
  const open = (e) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);

  const change = (code) => {
    i18n.changeLanguage(code);
    try { localStorage.setItem('lang', code); } catch {}
    close();
  };

  const langs = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
  ];

  return (
    <>
      <IconButton color="inherit" onClick={open} aria-label="Change language">
        <LanguageIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {langs.map((l) => (
          <MenuItem key={l.code} selected={i18n.language === l.code} onClick={() => change(l.code)}>
            <ListItemText>{l.name} ({l.code})</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
