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

import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import Router from 'express-promise-router';
import { addResourceRoutesToRouter } from './resourcesRoutes';
import { Entity } from '@backstage/catalog-model';
import {
  PermissionEvaluator,
  AuthorizeResult,
} from '@backstage/plugin-permission-common';

describe('resourcesRoutes', () => {
  let app: express.Express;
  let permissions: jest.Mocked<PermissionEvaluator>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const router = Router();
    permissions = {
      authorize: jest.fn(),
      authorizeConditional: jest.fn(),
    };
    addResourceRoutesToRouter(
      router,
      {
        getEntityByRef: jest.fn().mockImplementation(entityRef => {
          if (entityRef.name === 'noentity') {
            return Promise.resolve(undefined);
          }
          return Promise.resolve({
            kind: entityRef.kind,
            metadata: {
              name: entityRef.name,
              namespace: entityRef.namespace,
            },
          } as Entity);
        }),
      } as any,
      {
        getKubernetesObjectsByEntity: jest.fn().mockImplementation(args => {
          if (args.entity.metadata.name === 'inject500') {
            return Promise.reject(new Error('some internal error'));
          }
          return Promise.resolve({
            items: [
              {
                cluster: {
                  name: 'clusterOne',
                },
                podMetrics: [],
                resources: [
                  {
                    type: 'pods',
                    resources: [
                      {
                        metadata: {
                          name: 'pod1',
                        },
                      },
                    ],
                  },
                  { type: 'services', resources: [] },
                  { type: 'configmaps', resources: [] },
                  { type: 'limitranges', resources: [] },
                  {
                    type: 'deployments',
                    resources: [
                      {
                        metadata: {
                          name: 'deployment1',
                        },
                      },
                    ],
                  },
                  { type: 'replicasets', resources: [] },
                  { type: 'horizontalpodautoscalers', resources: [] },
                  { type: 'jobs', resources: [] },
                  { type: 'cronjobs', resources: [] },
                  { type: 'ingresses', resources: [] },
                  { type: 'statefulsets', resources: [] },
                  { type: 'daemonsets', resources: [] },
                ],
                errors: [],
              },
            ],
          });
        }),
        getCustomResourcesByEntity: jest.fn().mockImplementation(args => {
          if (args.entity.metadata.name === 'inject500') {
            return Promise.reject(new Error('some internal error'));
          }

          return Promise.resolve({
            items: [
              {
                clusterOne: {
                  pods: [
                    {
                      metadata: {
                        name: 'pod1',
                      },
                    },
                  ],
                },
              },
            ],
          });
        }),
      } as any,
      permissions,
    );
    app.use('/', router);
    app.use(errorHandler());
  });

  beforeEach(() => {
    permissions.authorizeConditional.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
  });

  describe('POST /resources/workloads/query', () => {
    // eslint-disable-next-line jest/expect-expect
    it('200 happy path', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          entityRef: 'kind:namespacec/someComponent',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(200, {
          items: [
            {
              cluster: {
                name: 'clusterOne',
              },
              podMetrics: [],
              resources: [
                {
                  type: 'pods',
                  resources: [
                    {
                      metadata: {
                        name: 'pod1',
                      },
                    },
                  ],
                },
                { type: 'services', resources: [] },
                { type: 'configmaps', resources: [] },
                { type: 'limitranges', resources: [] },
                {
                  type: 'deployments',
                  resources: [
                    {
                      metadata: {
                        name: 'deployment1',
                      },
                    },
                  ],
                },
                { type: 'replicasets', resources: [] },
                { type: 'horizontalpodautoscalers', resources: [] },
                { type: 'jobs', resources: [] },
                { type: 'cronjobs', resources: [] },
                { type: 'ingresses', resources: [] },
                { type: 'statefulsets', resources: [] },
                { type: 'daemonsets', resources: [] },
              ],
              errors: [],
            },
          ],
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when missing entity ref', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: { name: 'InputError', message: 'entity is a required field' },
          request: {
            method: 'POST',
            url: '/resources/workloads/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when bad entity ref', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          entityRef: 'ffff',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message:
              'Invalid entity ref, Error: Entity reference "ffff" had missing or empty kind (e.g. did not start with "component:" or similar)',
          },
          request: {
            method: 'POST',
            url: '/resources/workloads/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when no entity in catalog', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          entityRef: 'noentity:noentity',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message: 'Entity ref missing, noentity:default/noentity',
          },
          request: {
            method: 'POST',
            url: '/resources/workloads/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('401 when no Auth header', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .expect(401, {
          error: { name: 'AuthenticationError', message: 'No Backstage token' },
          request: {
            method: 'POST',
            url: '/resources/workloads/query',
          },
          response: { statusCode: 401 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('401 when invalid Auth header', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'ffffff')
        .expect(401, {
          error: { name: 'AuthenticationError', message: 'No Backstage token' },
          request: {
            method: 'POST',
            url: '/resources/workloads/query',
          },
          response: { statusCode: 401 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('500 handle gracefully', async () => {
      await request(app)
        .post('/resources/workloads/query')
        .send({
          entityRef: 'inject500:inject500/inject500',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(500, {
          error: {
            name: 'Error',
            message: 'some internal error',
          },
          request: { method: 'POST', url: '/resources/workloads/query' },
          response: { statusCode: 500 },
        });
    });

    describe('permissions framework is enabled', () => {
      // eslint-disable-next-line jest/expect-expect
      it('returns a 403 response if Permission Policy is in place that blocks endpoint', async () => {
        permissions.authorizeConditional.mockResolvedValue([
          { result: AuthorizeResult.DENY },
        ]);

        await request(app)
          .post('/resources/workloads/query')
          .send({
            entityRef: 'kind:namespacec/someComponent',
            auth: {
              google: 'something',
            },
          })
          .set('Content-Type', 'application/json')
          .set('Authorization', 'Bearer Zm9vYmFy')
          .expect(403);
      });

      it('Filters out deployments if Permission Policy only allows access to pods', async () => {
        permissions.authorizeConditional.mockResolvedValue([
          {
            result: AuthorizeResult.CONDITIONAL,
            pluginId: 'kubernetes',
            resourceType: 'kubernetes-resource',
            conditions: {
              resourceType: 'kubernetes-resource',
              rule: 'IS_OF_KIND',
              params: {
                kind: 'pods',
              },
            },
          },
        ]);

        await request(app)
          .post('/resources/workloads/query')
          .send({
            entityRef: 'kind:namespacec/someComponent',
            auth: {
              google: 'something',
            },
          })
          .set('Content-Type', 'application/json')
          .set('Authorization', 'Bearer Zm9vYmFy')
          .expect(200)
          .expect(res => {
            expect(res.body).toStrictEqual({
              items: [
                {
                  cluster: {
                    name: 'clusterOne',
                  },
                  podMetrics: [],
                  resources: [
                    {
                      type: 'pods',
                      resources: [
                        {
                          metadata: {
                            name: 'pod1',
                          },
                        },
                      ],
                    },
                  ],
                  errors: [],
                },
              ],
            });
          });
      });

      it('filters in both pods and deployments if Permission Policy allows access to both pods and deployments', async () => {
        permissions.authorizeConditional.mockReturnValue(
          Promise.resolve([
            {
              result: AuthorizeResult.CONDITIONAL,
              pluginId: 'kubernetes',
              resourceType: 'kubernetes-resource',
              conditions: {
                anyOf: [
                  {
                    resourceType: 'kubernetes-resource',
                    rule: 'IS_OF_KIND',
                    params: {
                      kind: 'pods',
                    },
                  },
                  {
                    resourceType: 'kubernetes-resource',
                    rule: 'IS_OF_KIND',
                    params: {
                      kind: 'deployments',
                    },
                  },
                ],
              },
            },
          ]),
        );

        await request(app)
          .post('/resources/workloads/query')
          .send({
            entityRef: 'kind:namespacec/someComponent',
            auth: {
              google: 'something',
            },
          })
          .set('Content-Type', 'application/json')
          .set('Authorization', 'Bearer Zm9vYmFy')
          .expect(200)
          .expect(res => {
            expect(res.body).toStrictEqual({
              items: [
                {
                  cluster: {
                    name: 'clusterOne',
                  },
                  podMetrics: [],
                  resources: [
                    {
                      type: 'pods',
                      resources: [
                        {
                          metadata: {
                            name: 'pod1',
                          },
                        },
                      ],
                    },
                    {
                      type: 'deployments',
                      resources: [
                        {
                          metadata: {
                            name: 'deployment1',
                          },
                        },
                      ],
                    },
                  ],
                  errors: [],
                },
              ],
            });
          });
      });
    });
  });
  describe('POST /resources/custom/query', () => {
    // eslint-disable-next-line jest/expect-expect
    it('200 happy path', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(200, {
          items: [
            {
              clusterOne: {
                pods: [
                  {
                    metadata: {
                      name: 'pod1',
                    },
                  },
                ],
              },
            },
          ],
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when missing custom resources', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message: 'customResources is a required field',
          },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when custom resources not array', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
          customResources: 'somestring',
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message: 'customResources must be an array',
          },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when custom resources empty', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
          customResources: [],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message: 'at least 1 customResource is required',
          },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when missing entity ref', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: { name: 'InputError', message: 'entity is a required field' },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when bad entity ref', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'ffff',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message:
              'Invalid entity ref, Error: Entity reference "ffff" had missing or empty kind (e.g. did not start with "component:" or similar)',
          },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('400 when no entity in catalog', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'noentity:noentity',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(400, {
          error: {
            name: 'InputError',
            message: 'Entity ref missing, noentity:default/noentity',
          },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 400 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('401 when no Auth header', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .expect(401, {
          error: { name: 'AuthenticationError', message: 'No Backstage token' },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 401 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('401 when invalid Auth header', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'ffffff')
        .expect(401, {
          error: { name: 'AuthenticationError', message: 'No Backstage token' },
          request: {
            method: 'POST',
            url: '/resources/custom/query',
          },
          response: { statusCode: 401 },
        });
    });
    // eslint-disable-next-line jest/expect-expect
    it('403 response if Permission Policy is in place that blocks endpoint', async () => {
      permissions.authorizeConditional.mockResolvedValue([
        { result: AuthorizeResult.DENY },
      ]);

      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'component:someComponent',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(403);
    });
    // eslint-disable-next-line jest/expect-expect
    it('500 handle gracefully', async () => {
      await request(app)
        .post('/resources/custom/query')
        .send({
          entityRef: 'inject500:inject500/inject500',
          auth: {
            google: 'something',
          },
          customResources: [
            {
              group: 'someGroup',
              apiVersion: 'someApiVersion',
              plural: 'somePlural',
            },
          ],
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer Zm9vYmFy')
        .expect(500, {
          error: {
            name: 'Error',
            message: 'some internal error',
          },
          request: { method: 'POST', url: '/resources/custom/query' },
          response: { statusCode: 500 },
        });
    });
  });
});
