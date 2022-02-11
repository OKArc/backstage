/*
 * Copyright 2020 The Backstage Authors
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
import {
  pagerDutyApiRef,
  pagerdutyUserApiRef,
  PagerDutyClient,
  PagerDutyUserClient,
} from './api';
import {
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  configApiRef,
  createComponentExtension,
  pagerdutyAuthApiRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'pagerduty',
});

export const pagerDutyPlugin = createPlugin({
  id: 'pagerduty',
  apis: [
    createApiFactory({
      api: pagerdutyUserApiRef,
      deps: { configApi: configApiRef, pagerdutyAuthApi: pagerdutyAuthApiRef },
      factory: ({ pagerdutyAuthApi }) =>
        PagerDutyUserClient.fromConfig({ pagerdutyAuthApi }),
    }),
    createApiFactory({
      api: pagerDutyApiRef,
      deps: { discoveryApi: discoveryApiRef, configApi: configApiRef },
      factory: ({ configApi, discoveryApi }) =>
        PagerDutyClient.fromConfig(configApi, discoveryApi),
    }),
  ],
});

export const EntityPagerDutyCard = pagerDutyPlugin.provide(
  createComponentExtension({
    name: 'EntityPagerDutyCard',
    component: {
      lazy: () =>
        import('./components/PagerDutyCard').then(m => m.PagerDutyCard),
    },
  }),
);
