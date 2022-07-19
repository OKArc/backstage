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

import { TaskRunner } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import {
  GithubCredentialsProvider,
  ScmIntegrations,
  GitHubIntegrationConfig,
  GitHubIntegration,
  SingleInstanceGithubCredentialsProvider,
} from '@backstage/integration';
import {
  EntityProvider,
  EntityProviderConnection,
  LocationSpec,
  locationSpecToLocationEntity,
} from '@backstage/plugin-catalog-backend';

import { graphql } from '@octokit/graphql';
import * as uuid from 'uuid';
import { Logger } from 'winston';
import {
  readProviderConfigs,
  GitHubEntityProviderConfig,
} from './GitHubEntityProviderConfig';
import { getOrganizationRepositories } from '../lib/github';

/**
 * Options for {@link GitHubEntityProvider}.
 *
 * @public
 */
export interface GitHubEntityProviderOptions {
  // /**
  //  * A Scheduled Task Runner
  //  *
  //  * {@link @backstage/backend-tasks#PluginTaskScheduler.createScheduledTaskRunner}
  //  * to enable automatic scheduling of tasks.
  //  */
  schedule: TaskRunner;

  /**
   * The logger to use.
   */
  logger: Logger;
}

type CreateLocationSpec = {
  url: string;
  branchName: string | undefined;
  catalogFile: string;
};

/**
 * Discovers catalog files located in [GitHub](https://github.com).
 * The provider will search your GitHub account and register catalog files matching the configured path
 * as Location entity and via following processing steps add all contained catalog entities.
 * This can be useful as an alternative to static locations or manually adding things to the catalog.
 *
 * @public
 */
export class GitHubEntityProvider implements EntityProvider {
  private readonly config: GitHubEntityProviderConfig;
  private readonly logger: Logger;
  private readonly integration: GitHubIntegrationConfig;
  private readonly scheduleFn: () => Promise<void>;
  private connection?: EntityProviderConnection;
  private readonly githubCredentialsProvider: GithubCredentialsProvider;

  static fromConfig(
    config: Config,
    options: GitHubEntityProviderOptions,
  ): GitHubEntityProvider[] {
    const integrations = ScmIntegrations.fromConfig(config);
    const integration = integrations.github.byHost('github.com');

    if (!integration) {
      throw new Error(
        `Missing GitHub Integration. Please add a configuration entry for it under integrations.github`,
      );
    }

    return readProviderConfigs(config).map(
      providerConfig =>
        new GitHubEntityProvider(
          providerConfig,
          integration,
          options.logger,
          options.schedule,
        ),
    );
  }

  private constructor(
    config: GitHubEntityProviderConfig,
    integration: GitHubIntegration,
    logger: Logger,
    schedule: TaskRunner,
  ) {
    this.config = config;
    this.integration = integration.config;
    this.logger = logger.child({
      target: this.getProviderName(),
    });
    this.scheduleFn = this.createScheduleFn(schedule);
    this.githubCredentialsProvider =
      SingleInstanceGithubCredentialsProvider.create(integration.config);
    this.scheduleFn = this.createScheduleFn(schedule);
  }

  /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.getProviderName} */
  getProviderName(): string {
    return `github-provider:${this.config.id}`;
  }

  /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.connect} */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    return await this.scheduleFn();
  }

  private createScheduleFn(schedule: TaskRunner): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:refresh`;
      return schedule.run({
        id: taskId,
        fn: async () => {
          const logger = this.logger.child({
            taskId,
            taskInstanceId: uuid.v4(),
          });
          try {
            await this.refresh(logger);
          } catch (error) {
            logger.error(error);
          }
        },
      });
    };
  }

  async refresh(logger: Logger) {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const { org, repoSearchPath, catalogPath, branch, host } = parseUrl(
      this.config.target,
    );

    // Building the org url here so that the github creds provider doesn't need to know
    // about how to handle the wild card
    const orgUrl = `https://${host}/${org}`;

    const { headers } = await this.githubCredentialsProvider.getCredentials({
      url: orgUrl,
    });

    const client = graphql.defaults({
      baseUrl: this.integration.apiBaseUrl,
      headers,
    });

    // Read out all of the raw data
    const startTimestamp = Date.now();
    logger.info(`Reading GitHub repositories from ${orgUrl}`);

    const { repositories } = await getOrganizationRepositories(client, org);
    const matching = repositories.filter(
      r =>
        !r.isArchived &&
        repoSearchPath.test(r.name) &&
        r.defaultBranchRef?.name,
    );

    const duration = ((Date.now() - startTimestamp) / 1000).toFixed(1);
    logger.debug(
      `Read ${repositories.length} GitHub repositories (${matching.length} matching the pattern) in ${duration} seconds`,
    );

    const locations = matching.map(repository => {
      const branchName =
        branch === '-' ? repository.defaultBranchRef?.name : branch;
      return this.createLocationSpec({
        url: repository.url,
        branchName,
        catalogFile: catalogPath,
      });
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: locations.flat().map(location => ({
        locationKey: this.getProviderName(),
        entity: locationSpecToLocationEntity({ location }),
      })),
    });
  }

  private createLocationSpec({
    url,
    branchName,
    catalogFile,
  }: CreateLocationSpec): LocationSpec {
    return {
      type: 'url',
      target: `${url}/blob/${branchName}/${catalogFile}`,
      presence: 'optional',
    };
  }
}

/*
 * Helpers
 */

export function parseUrl(urlString: string): {
  org: string;
  repoSearchPath: RegExp;
  catalogPath: string;
  branch: string;
  host: string;
} {
  const url = new URL(urlString);
  const path = url.pathname.substr(1).split('/');

  // /backstage/techdocs-*/blob/master/catalog-info.yaml
  // can also be
  // /backstage
  if (path.length > 2 && path[0].length && path[1].length) {
    return {
      org: decodeURIComponent(path[0]),
      repoSearchPath: escapeRegExp(decodeURIComponent(path[1])),
      catalogPath: `/${decodeURIComponent(path.slice(4).join('/'))}`,
      branch: decodeURIComponent(path[3]),
      host: url.host,
    };
  } else if (path.length === 1 && path[0].length) {
    return {
      org: decodeURIComponent(path[0]),
      repoSearchPath: escapeRegExp('*'),
      catalogPath: '/catalog-info.yaml',
      branch: '-',
      host: url.host,
    };
  }

  throw new Error(`Failed to parse ${urlString}`);
}

export function escapeRegExp(str: string): RegExp {
  return new RegExp(`^${str.replace(/\*/g, '.*')}$`);
}
