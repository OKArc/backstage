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

// ******************************************************************
// * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY. *
// ******************************************************************
import type {
  AnalyzeLocation,
  CreateLocation,
  DeleteEntityByUid,
  DeleteLocation,
  GetEntities,
  GetEntitiesByQuery,
  GetEntitiesByRefs,
  GetEntityAncestryByName,
  GetEntityByName,
  GetEntityByUid,
  GetEntityFacets,
  GetLocation,
  GetLocationByEntity,
  GetLocations,
  RefreshEntity,
  ValidateEntity,
} from '@backstage/plugin-catalog-common/client';

/**
 * no description
 */

export type EndpointMap = {
  '#post|/analyze-location': AnalyzeLocation;

  '#post|/locations': CreateLocation;

  '#_delete|/entities/by-uid/{uid}': DeleteEntityByUid;

  '#_delete|/locations/{id}': DeleteLocation;

  '#get|/entities': GetEntities;

  '#get|/entities/by-query': GetEntitiesByQuery;

  '#post|/entities/by-refs': GetEntitiesByRefs;

  '#get|/entities/by-name/{kind}/{namespace}/{name}/ancestry': GetEntityAncestryByName;

  '#get|/entities/by-name/{kind}/{namespace}/{name}': GetEntityByName;

  '#get|/entities/by-uid/{uid}': GetEntityByUid;

  '#get|/entity-facets': GetEntityFacets;

  '#get|/locations/{id}': GetLocation;

  '#get|/locations/by-entity/{kind}/{namespace}/{name}': GetLocationByEntity;

  '#get|/locations': GetLocations;

  '#post|/refresh': RefreshEntity;

  '#post|/validate-entity': ValidateEntity;
};
