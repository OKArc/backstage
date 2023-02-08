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

import { createApiRef } from '@backstage/core-plugin-api';
import {
  AzureSiteListRequest,
  AzureSiteListResponse,
  AzureSiteStartStopRequest,
} from '@backstage/plugin-azure-sites-common';
import { CompoundEntityRef } from '@backstage/catalog-model';

/** @public */
export const azureSiteApiRef = createApiRef<AzureSitesApi>({
  id: 'plugin.azure-sites.service',
});

/** @public */
export type AzureSitesApi = {
  list: (request: AzureSiteListRequest) => Promise<AzureSiteListResponse>;
  start: (
    request: AzureSiteStartStopRequest,
    entity: CompoundEntityRef,
  ) => Promise<void>;
  stop: (
    request: AzureSiteStartStopRequest,
    entity: CompoundEntityRef,
  ) => Promise<void>;
};
