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

import {
  coreServices,
  createBackendModule,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { loggerToWinstonLogger } from '@backstage/backend-common';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import {
  GroupTransformer,
  OrganizationTransformer,
  UserTransformer,
} from '@backstage/plugin-catalog-backend-module-msgraph';
import { MicrosoftGraphOrgEntityProvider } from '../processors';

/**
 * Interface for {@link microsoftGraphOrgEntityProviderTransformExtensionPoint}.
 *
 * @alpha
 */
export interface MicrosoftGraphOrgEntityProviderTransformsExtensionPoint {
  /**
   * Set the function that transforms a user entry in msgraph to an entity.
   * Optionally, you can pass separate transformers per provider ID.
   */
  setUserTransformer(
    transformer: UserTransformer | Record<string, UserTransformer>,
  ): void;

  /**
   * Set the function that transforms a group entry in msgraph to an entity.
   * Optionally, you can pass separate transformers per provider ID.
   */
  setGroupTransformer(
    transformer: GroupTransformer | Record<string, GroupTransformer>,
  ): void;

  /**
   * Set the function that transforms an organization entry in msgraph to an entity.
   * Optionally, you can pass separate transformers per provider ID.
   */
  setOrganizationTransformer(
    transformer:
      | OrganizationTransformer
      | Record<string, OrganizationTransformer>,
  ): void;
}

/**
 * Extension point used to customize the transforms used by the module.
 *
 * @alpha
 */
export const microsoftGraphOrgEntityProviderTransformExtensionPoint =
  createExtensionPoint<MicrosoftGraphOrgEntityProviderTransformsExtensionPoint>(
    {
      id: 'catalog.microsoftGraphOrgEntityProvider.transforms',
    },
  );

/**
 * Registers the MicrosoftGraphOrgEntityProvider with the catalog processing extension point.
 *
 * @alpha
 */
export const catalogModuleMicrosoftGraphOrgEntityProvider = createBackendModule(
  {
    pluginId: 'catalog',
    moduleId: 'microsoftGraphOrgEntityProvider',
    register(env) {
      let userTransformer:
        | UserTransformer
        | Record<string, UserTransformer>
        | undefined;
      let groupTransformer:
        | GroupTransformer
        | Record<string, GroupTransformer>
        | undefined;
      let organizationTransformer:
        | OrganizationTransformer
        | Record<string, OrganizationTransformer>
        | undefined;

      env.registerExtensionPoint(
        microsoftGraphOrgEntityProviderTransformExtensionPoint,
        {
          setUserTransformer(transformer) {
            if (userTransformer) {
              throw new Error('User transformer may only be set once');
            }
            userTransformer = transformer;
          },
          setGroupTransformer(transformer) {
            if (groupTransformer) {
              throw new Error('Group transformer may only be set once');
            }
            groupTransformer = transformer;
          },
          setOrganizationTransformer(transformer) {
            if (organizationTransformer) {
              throw new Error('Organization transformer may only be set once');
            }
            organizationTransformer = transformer;
          },
        },
      );

      env.registerInit({
        deps: {
          catalog: catalogProcessingExtensionPoint,
          config: coreServices.rootConfig,
          logger: coreServices.logger,
          scheduler: coreServices.scheduler,
        },
        async init({ catalog, config, logger, scheduler }) {
          catalog.addEntityProvider(
            MicrosoftGraphOrgEntityProvider.fromConfig(config, {
              logger: loggerToWinstonLogger(logger),
              scheduler,
              userTransformer: userTransformer,
              groupTransformer: groupTransformer,
              organizationTransformer: organizationTransformer,
            }),
          );
        },
      });
    },
  },
);
