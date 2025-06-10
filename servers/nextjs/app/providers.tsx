'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import { StoreInitializer } from './storeInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>
    <StoreInitializer>{children}</StoreInitializer>
  </Provider>;
}
