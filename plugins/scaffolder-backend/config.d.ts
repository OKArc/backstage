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

export interface Config {
  /** Configuration options for the scaffolder plugin */
  scaffolder?: {
    /**
     * The commit author info used when new components are created.
     */
    defaultAuthor?: {
      name?: string;
      email?: string;
    };
    /**
     * The commit message used when new components are created.
     */
    defaultCommitMessage?: string;
    /**
     * @deprecated Replaced by parameters for the publish:github action
     */
    github?: {
      [key: string]: string;
    };
    /**
     * @deprecated Use the Gitlab integration instead
     */
    gitlab?: {
      api: { [key: string]: string };
    };
    /**
     * @deprecated Use the Azure integration instead
     */
    azure?: {
      baseUrl: string;
      api: { [key: string]: string };
    };
    /**
     * @deprecated Use the Bitbucket integration instead
     */
    bitbucket?: {
      api: { [key: string]: string };
    };
  };
}
