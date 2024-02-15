/*
 * Copyright 2024 The Backstage Authors
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

import { Entity } from '@backstage/catalog-model';

export const KUBERNETES_ANNOTATION = 'backstage.io/kubernetes-id';
export const KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

export const isKubernetesAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[KUBERNETES_ANNOTATION]) ||
  Boolean(
    entity.metadata.annotations?.[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION],
  );
