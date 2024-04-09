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
import { DiscoveryApi } from '../types/discovery';
import { FetchApi } from '../types/fetch';
import crossFetch from 'cross-fetch';
import { pluginId } from '../pluginId';
import * as parser from 'uri-template';

import { ListTodos200Response } from '../models/ListTodos200Response.model';

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
 * @public
 */
export type ListTodos = {
  query: {
    entity?: string;
    orderBy?: string;
    filter?: Array<string>;
    offset?: number;
    limit?: number;
  };
};

/**
 * no description
 * @public
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
   * @param entity -
   * @param orderBy -
   * @param filter -
   * @param offset -
   * @param limit -
   */
  public async listTodos(
    request: ListTodos,
    options?: RequestOptions,
  ): Promise<TypedResponse<ListTodos200Response>> {
    const baseUrl = await this.discoveryApi.getBaseUrl(pluginId);

    const uriTemplate = `/v1/todos{?entity,orderBy,filter*,offset,limit}`;

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
}
