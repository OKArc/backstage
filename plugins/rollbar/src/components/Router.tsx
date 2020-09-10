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

import React from 'react';
import { Routes, Route } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import { WarningPanel } from '@backstage/core';
import { catalogRouteRef } from '../routes';
import { ROLLBAR_ANNOTATION } from '../constants';
import { EntityPageRollbar } from './EntityPageRollbar/EntityPageRollbar';

export const isPluginApplicableToEntity = (entity: Entity) =>
  entity.metadata.annotations?.[ROLLBAR_ANNOTATION] !== '';

type Props = {
  entity: Entity;
};

export const Router = ({ entity }: Props) =>
  !isPluginApplicableToEntity(entity) ? (
    <WarningPanel title="Rollbar plugin:">
      <pre>{ROLLBAR_ANNOTATION}</pre> annotation is missing on the entity.
    </WarningPanel>
  ) : (
    <Routes>
      <Route
        path={`/${catalogRouteRef.path}`}
        element={<EntityPageRollbar entity={entity} />}
      />
    </Routes>
  );
