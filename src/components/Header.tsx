import React from 'react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="mb-16 text-center relative z-10">
      <h1 className="text-6xl font-extrabold text-accent tracking-wider mb-2 drop-shadow-lg leading-tight">
        {t('title')}
      </h1>
      <p className="text-lg text-secondary-text opacity-90">
        {t('subtitle')}
      </p>
    </header>
  );
};

export default Header;
