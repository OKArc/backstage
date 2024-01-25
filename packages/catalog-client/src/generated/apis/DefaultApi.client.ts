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

/**
 * NOTE: This class is auto generated, do not edit the class manually.
 */
import { DiscoveryApi } from '../types/discovery';
import { FetchApi } from '../types/fetch';
import crossFetch from 'cross-fetch';
import { pluginId } from '../pluginId';
import * as parser from 'uri-template';

import { AnalyzeLocationRequest } from '../models/AnalyzeLocationRequest.model';
import { AnalyzeLocationResponse } from '../models/AnalyzeLocationResponse.model';
import { CreateLocation201Response } from '../models/CreateLocation201Response.model';
import { CreateLocationRequest } from '../models/CreateLocationRequest.model';
import { EntitiesBatchResponse } from '../models/EntitiesBatchResponse.model';
import { EntitiesQueryResponse } from '../models/EntitiesQueryResponse.model';
import { Entity } from '../models/Entity.model';
import { EntityAncestryResponse } from '../models/EntityAncestryResponse.model';
import { EntityFacetsResponse } from '../models/EntityFacetsResponse.model';
import { GetEntitiesByRefsRequest } from '../models/GetEntitiesByRefsRequest.model';
import { GetLocations200ResponseInner } from '../models/GetLocations200ResponseInner.model';
import { Location } from '../models/Location.model';
import { RefreshEntityRequest } from '../models/RefreshEntityRequest.model';
import { ValidateEntityRequest } from '../models/ValidateEntityRequest.model';

/**
 * Wraps the Response type to convey a type on the json call.
 *
 * @public
 */
export type TypedResponse<T> = Omit<Response, 'json'> & {
  json: () => Promise<T>;
};

/**
 * Options you can pass into a request for additional information.
 *
 * @public
 */
export interface RequestOptions {
  token?: string;
}

/**
 * no description
 */
export class DefaultApiClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: {
    discoveryApi: { getBaseUrl(pluginId: string): Promise<string> };
    fetchApi?: { fetch: typeof fetch };
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi || { fetch: crossFetch };
  }

  /**
   * Validate a given location.
   * @param analyzeLocationRequest
   */
  public async analyzeLocation(
    // @ts-ignore
    request: {
      body: AnalyzeLocationRequest;
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<AnalyzeLocationResponse>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/analyze-location`;

    const uri = parser.parse(uriTemplate).expand({});

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'POST',
      body: JSON.stringify(request.body),
    });
  }

  /**
   * Create a location for a given target.
   * @param createLocationRequest
   * @param dryRun
   */
  public async createLocation(
    // @ts-ignore
    request: {
      body: CreateLocationRequest;
      query: {
        dryRun?: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<CreateLocation201Response>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/locations{?dryRun}`;

    const uri = parser.parse(uriTemplate).expand({
      ...request.query,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'POST',
      body: JSON.stringify(request.body),
    });
  }

  /**
   * Delete a single entity by UID.
   * @param uid
   */
  public async deleteEntityByUid(
    // @ts-ignore
    request: {
      path: {
        uid: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<void>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities/by-uid/{uid}`;

    const uri = parser.parse(uriTemplate).expand({
      uid: request.path.uid,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'DELETE',
    });
  }

  /**
   * Delete a location by id.
   * @param id
   */
  public async deleteLocation(
    // @ts-ignore
    request: {
      path: {
        id: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<void>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/locations/{id}`;

    const uri = parser.parse(uriTemplate).expand({
      id: request.path.id,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'DELETE',
    });
  }

  /**
   * Get all entities matching a given filter.
   * @param fields Restrict to just these fields in the response.
   * @param limit Number of records to return in the response.
   * @param filter Filter for just the entities defined by this filter.
   * @param offset Number of records to skip in the query page.
   * @param after Pointer to the previous page of results.
   * @param order
   */
  public async getEntities(
    // @ts-ignore
    request: {
      query: {
        fields?: Array<string>;
        limit?: number;
        filter?: Array<string>;
        offset?: number;
        after?: string;
        order?: Array<string>;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<Array<Entity>>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities{?fields,limit,filter*,offset,after,order*}`;

    const uri = parser.parse(uriTemplate).expand({
      ...request.query,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Search for entities by a given query.
   * @param fields Restrict to just these fields in the response.
   * @param limit Number of records to return in the response.
   * @param orderField The fields to sort returned results by.
   * @param cursor Cursor to a set page of results.
   * @param filter Filter for just the entities defined by this filter.
   * @param fullTextFilterTerm Text search term.
   * @param fullTextFilterFields A comma separated list of fields to sort returned results by.
   */
  public async getEntitiesByQuery(
    // @ts-ignore
    request: {
      query: {
        fields?: Array<string>;
        limit?: number;
        orderField?: Array<string>;
        cursor?: string;
        filter?: Array<string>;
        fullTextFilterTerm?: string;
        fullTextFilterFields?: Array<string>;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<EntitiesQueryResponse>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities/by-query{?fields,limit,orderField*,cursor,filter*,fullTextFilterTerm,fullTextFilterFields}`;

    const uri = parser.parse(uriTemplate).expand({
      ...request.query,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get a batch set of entities given an array of entityRefs.
   * @param getEntitiesByRefsRequest
   */
  public async getEntitiesByRefs(
    // @ts-ignore
    request: {
      body: GetEntitiesByRefsRequest;
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<EntitiesBatchResponse>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities/by-refs`;

    const uri = parser.parse(uriTemplate).expand({});

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'POST',
      body: JSON.stringify(request.body),
    });
  }

  /**
   * Get an entity's ancestry by entity ref.
   * @param kind
   * @param namespace
   * @param name
   */
  public async getEntityAncestryByName(
    // @ts-ignore
    request: {
      path: {
        kind: string;
        namespace: string;
        name: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<EntityAncestryResponse>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities/by-name/{kind}/{namespace}/{name}/ancestry`;

    const uri = parser.parse(uriTemplate).expand({
      kind: request.path.kind,
      namespace: request.path.namespace,
      name: request.path.name,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get an entity by an entity ref.
   * @param kind
   * @param namespace
   * @param name
   */
  public async getEntityByName(
    // @ts-ignore
    request: {
      path: {
        kind: string;
        namespace: string;
        name: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<Entity>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities/by-name/{kind}/{namespace}/{name}`;

    const uri = parser.parse(uriTemplate).expand({
      kind: request.path.kind,
      namespace: request.path.namespace,
      name: request.path.name,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get a single entity by the UID.
   * @param uid
   */
  public async getEntityByUid(
    // @ts-ignore
    request: {
      path: {
        uid: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<Entity>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entities/by-uid/{uid}`;

    const uri = parser.parse(uriTemplate).expand({
      uid: request.path.uid,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get all entity facets that match the given filters.
   * @param facet
   * @param filter Filter for just the entities defined by this filter.
   */
  public async getEntityFacets(
    // @ts-ignore
    request: {
      query: {
        facet: Array<string>;
        filter?: Array<string>;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<EntityFacetsResponse>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/entity-facets{?facet*,filter*}`;

    const uri = parser.parse(uriTemplate).expand({
      ...request.query,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get a location by id.
   * @param id
   */
  public async getLocation(
    // @ts-ignore
    request: {
      path: {
        id: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<Location>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/locations/{id}`;

    const uri = parser.parse(uriTemplate).expand({
      id: request.path.id,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get a location for entity.
   * @param kind
   * @param namespace
   * @param name
   */
  public async getLocationByEntity(
    // @ts-ignore
    request: {
      path: {
        kind: string;
        namespace: string;
        name: string;
      };
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<Location>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/locations/by-entity/{kind}/{namespace}/{name}`;

    const uri = parser.parse(uriTemplate).expand({
      kind: request.path.kind,
      namespace: request.path.namespace,
      name: request.path.name,
    });

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Get all locations
   */
  public async getLocations(
    // @ts-ignore
    request: {},
    options?: RequestOptions,
  ): Promise<TypedResponse<Array<GetLocations200ResponseInner>>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/locations`;

    const uri = parser.parse(uriTemplate).expand({});

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'GET',
    });
  }

  /**
   * Refresh the entity related to entityRef.
   * @param refreshEntityRequest
   */
  public async refreshEntity(
    // @ts-ignore
    request: {
      body: RefreshEntityRequest;
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<void>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/refresh`;

    const uri = parser.parse(uriTemplate).expand({});

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'POST',
      body: JSON.stringify(request.body),
    });
  }

  /**
   * Validate that a passed in entity has no errors in schema.
   * @param validateEntityRequest
   */
  public async validateEntity(
    // @ts-ignore
    request: {
      body: ValidateEntityRequest;
    },
    options?: RequestOptions,
  ): Promise<TypedResponse<void>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/validate-entity`;

    const uri = parser.parse(uriTemplate).expand({});

    return await this.fetchApi.fetch(`${baseUrl}${uri}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
      method: 'POST',
      body: JSON.stringify(request.body),
    });
  }
}
