/*
 * Copyright 2020 The Backstage Authors
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
  ANNOTATION_GITHUB_USER_LOGIN,
  ANNOTATION_GITHUB_TEAM_SLUG,
} from './annotation';

describe('Annotations', () => {
  it('should check values of constants in annotations', () => {
    expect(ANNOTATION_GITHUB_USER_LOGIN).toEqual('github.com/user-login');
    expect(ANNOTATION_GITHUB_TEAM_SLUG).toEqual('github.com/team-slug');
  });
});
