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

import { Config } from '@backstage/config';

export type GitHubEntityProviderConfig = {
  id: string;
  target: string;
};

export function readProviderConfigs(
  config: Config,
): GitHubEntityProviderConfig[] {
  const providersConfig = config.getOptionalConfig('catalog.providers.github');
  if (!providersConfig) {
    return [];
  }

  return providersConfig.keys().map(id => {
    const providerConfig = providersConfig.getConfig(id);

    return readProviderConfig(id, providerConfig);
  });
}

function readProviderConfig(
  id: string,
  config: Config,
): GitHubEntityProviderConfig {
  const target = config.getString('target');
  return {
    id,
    target,
  };
}
