/*
 * Copyright 2023 The Backstage Authors
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
import { createValidatedOpenApiRouter } from '@backstage/backend-openapi-utils';

export const spec = {
  openapi: '3.0.3',
  info: {
    title: '@backstage/plugin-search-backend',
    version: '1',
    description:
      'The Backstage backend plugin that provides search functionality.',
    license: {
      name: 'Apache-2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
    contact: {},
  },
  servers: [
    {
      url: '/',
    },
  ],
  components: {
    examples: {},
    headers: {},
    parameters: {},
    requestBodies: {},
    responses: {
      ErrorResponse: {
        description: 'An error response from the backend.',
        content: {
          'application/json; charset=utf-8': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              message: {
                type: 'string',
              },
            },
            required: ['name', 'message'],
          },
          request: {
            type: 'object',
            properties: {
              method: {
                type: 'string',
              },
              url: {
                type: 'string',
              },
            },
            required: ['method', 'url'],
          },
          response: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number',
              },
            },
            required: ['statusCode'],
          },
        },
        required: ['error', 'request', 'response'],
      },
      JsonObject: {
        type: 'object',
        properties: {},
        additionalProperties: {},
      },
    },
    securitySchemes: {
      JWT: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/query': {
      get: {
        operationId: 'Query',
        description: 'Query documents with a given filter.',
        responses: {
          '200': {
            description: 'Ok',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            description: 'The "type" of the given document.',
                          },
                          document: {
                            type: 'object',
                            description:
                              'The raw value of the document, as indexed.',
                            properties: {
                              title: {
                                type: 'string',
                                description:
                                  'The primary name of the document (e.g. name, title, identifier, etc).',
                              },
                              text: {
                                type: 'string',
                                description:
                                  'Free-form text of the document (e.g. description, content, etc).',
                              },
                              location: {
                                type: 'string',
                                description:
                                  'The relative or absolute URL of the document (target when a search result is clicked).',
                              },
                            },
                          },
                          highlight: {
                            type: 'object',
                            description:
                              'Optional result highlight. Useful for improving the search result\ndisplay/experience.',
                          },
                          rank: {
                            type: 'integer',
                            description:
                              'Optional result rank, where 1 is the first/top result returned. \nUseful for understanding search effectiveness in analytics.',
                          },
                        },
                        required: ['type', 'document'],
                        additionalProperties: false,
                      },
                    },
                    nextPageCursor: {
                      type: 'string',
                    },
                    previousPageCursor: {
                      type: 'string',
                    },
                    numberOfResults: {
                      type: 'integer',
                    },
                  },
                  required: ['results'],
                },
              },
            },
          },
          default: {
            $ref: '#/components/responses/ErrorResponse',
          },
        },
        security: [
          {},
          {
            JWT: [],
          },
        ],
        parameters: [
          {
            name: 'term',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              default: '',
            },
          },
          {
            name: 'filters',
            in: 'query',
            required: false,
            style: 'deepObject',
            explode: true,
            schema: {
              $ref: '#/components/schemas/JsonObject',
            },
          },
          {
            name: 'types',
            in: 'query',
            required: false,
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          {
            name: 'pageCursor',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'pageLimit',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
            },
          },
        ],
      },
    },
  },
} as const;
export const createOpenApiRouter = async (
  options?: Parameters<typeof createValidatedOpenApiRouter>['1'],
) => createValidatedOpenApiRouter<typeof spec>(spec, options);
