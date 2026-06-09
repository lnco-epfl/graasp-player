import { createContext, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_LANG } from '@graasp/translations';

import { AccountType } from '@lnco-ai/sdk';

import i18n from '@/config/i18n';
import { hooks } from '@/config/queryClient';

type CurrentUserContextType = ReturnType<typeof useCurrentMember>;

const CurrentMemberContext = createContext<CurrentUserContextType>(
  {} as CurrentUserContextType,
);

const { useCurrentMember } = hooks;
type Props = {
  children: JSX.Element | JSX.Element[];
};

export const CurrentMemberContextProvider = ({
  children,
}: Props): JSX.Element => {
  const query = useCurrentMember();

  const [search] = useSearchParams();

  // update language depending on user setting
  const lang =
    query.data?.type === AccountType.Individual
      ? query.data?.extra?.lang
      : (search.get('lang') ?? DEFAULT_LANG);
  useEffect(() => {
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return (
    <CurrentMemberContext.Provider value={query}>
      {children}
    </CurrentMemberContext.Provider>
  );
};

export const useCurrentMemberContext = (): CurrentUserContextType =>
  useContext(CurrentMemberContext);
