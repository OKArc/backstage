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
  AuthorizeRequest,
  AuthorizeResult,
  PermissionCondition,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';
import { BackstageIdentity } from '@backstage/plugin-auth-backend';

export type PolicyAuthorizeRequest = Omit<AuthorizeRequest, 'resourceRef'>;

export type ConditionalPolicyResult = {
  result: AuthorizeResult.CONDITIONAL;
  conditions: {
    pluginId: string;
    resourceType: string;
    conditions: PermissionCriteria<PermissionCondition>;
  };
};

export type PolicyResult =
  | { result: AuthorizeResult.ALLOW | AuthorizeResult.DENY }
  | ConditionalPolicyResult;

export interface PermissionPolicy {
  handle(
    request: PolicyAuthorizeRequest,
    user?: BackstageIdentity,
  ): Promise<PolicyResult>;
}
