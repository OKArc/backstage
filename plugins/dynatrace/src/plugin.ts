/*
 * Copyright 2022 The Backstage Authors
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
import { dynatraceApiRef, DynatraceClient } from './api';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const dynatracePlugin = createPlugin({
  id: 'dynatrace',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: dynatraceApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, discoveryApi, identityApi }) =>
        new DynatraceClient({
          discoveryApi,
          identityApi,
        }),
    }),
  ],
});

export const DynatracePage = dynatracePlugin.provide(
  createRoutableExtension({
    name: 'DynatracePage',
    component: () =>
      import('./components/DynatraceTab').then(m => m.DynatraceTab),
    mountPoint: rootRouteRef,
  }),
);
