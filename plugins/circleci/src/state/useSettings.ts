/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { errorApiRef, useApi } from '@backstage/core';
import { useContext, useEffect } from 'react';
import { AppContext, STORAGE_KEY } from './AppState';
import { Settings } from './types';

export function useSettings() {
  const [settings, dispatch] = useContext(AppContext);

  const errorApi = useApi(errorApiRef);

  const rehydrate = () => {
    try {
      const stateFromStorage = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
      if (
        stateFromStorage &&
        Object.keys(stateFromStorage).some(
          k => (settings as any)[k] !== stateFromStorage[k],
        )
      )
        dispatch({
          type: 'setCredentials',
          payload: stateFromStorage,
        });
    } catch (error) {
      errorApi.post(error);
    }
  };

  useEffect(() => {
    rehydrate();
  }, []);

  const persist = (state: Settings) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  return [
    settings,
    {
      saveSettings: (state: Settings) => {
        persist(state);
        dispatch({
          type: 'setCredentials',
          payload: state,
        });
      },
      showSettings: () => dispatch({ type: 'showSettings' }),
      hideSettings: () => dispatch({ type: 'hideSettings' }),
    },
  ] as const;
}
