/*
 * Copyright 2021 The Backstage Authors
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
  ComponentEntity,
  Entity,
  ResourceEntity,
  SystemEntity,
} from '@backstage/catalog-model';
import { EntityTable } from '@backstage/plugin-catalog-react';
import { TableColumn } from '@backstage/core-components';

/** @public */
export const componentEntityColumns: TableColumn<ComponentEntity>[] = [
  EntityTable.columns.createEntityRefColumn({ defaultKind: 'component' }),
  EntityTable.columns.createOwnerColumn(),
  EntityTable.columns.createSpecTypeColumn(),
  EntityTable.columns.createSpecLifecycleColumn(),
  EntityTable.columns.createMetadataDescriptionColumn(),
];

/** @public */
export const componentEntityHelpLink: string =
  'https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component';

/** @public */
export const asComponentEntities = (entities: Entity[]): ComponentEntity[] =>
  entities as ComponentEntity[];

/** @public */
export const resourceEntityColumns: TableColumn<ResourceEntity>[] = [
  EntityTable.columns.createEntityRefColumn({ defaultKind: 'resource' }),
  EntityTable.columns.createOwnerColumn(),
  EntityTable.columns.createSpecTypeColumn(),
  EntityTable.columns.createSpecLifecycleColumn(),
  EntityTable.columns.createMetadataDescriptionColumn(),
];

/** @public */
export const resourceEntityHelpLink: string =
  'https://backstage.io/docs/features/software-catalog/descriptor-format#kind-resource';

/** @public */
export const asResourceEntities = (entities: Entity[]): ResourceEntity[] =>
  entities as ResourceEntity[];

/** @public */
export const systemEntityColumns: TableColumn<SystemEntity>[] = [
  EntityTable.columns.createEntityRefColumn({ defaultKind: 'system' }),
  EntityTable.columns.createOwnerColumn(),
  EntityTable.columns.createMetadataDescriptionColumn(),
];

/** @public */
export const systemEntityHelpLink: string =
  'https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system';

/** @public */
export const asSystemEntities = (entities: Entity[]): SystemEntity[] =>
  entities as SystemEntity[];
