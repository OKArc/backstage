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

import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { GitLabIntegration, ScmIntegrations } from '@backstage/integration';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  DeferredEntity,
  EntityProvider,
  EntityProviderConnection,
  locationSpecToLocationEntity,
} from '@backstage/plugin-catalog-node';
import { EventParams, EventSubscriber } from '@backstage/plugin-events-node';
import { WebhookProjectSchema, WebhookPushEventSchema } from '@gitbeaker/rest';
import * as uuid from 'uuid';
import { Logger } from 'winston';
import {
  GitLabClient,
  GitLabProject,
  GitlabProviderConfig,
  paginated,
  readGitlabConfigs,
} from '../lib';

import * as path from 'path';

const TOPIC_REPO_PUSH = 'gitlab.push';

type Result = {
  scanned: number;
  matches: GitLabProject[];
};

/**
 * Discovers catalog files located in your GitLab instance.
 * The provider will search your GitLab instance's projects and register catalog files matching the configured path
 * as Location entity and via following processing steps add all contained catalog entities.
 * This can be useful as an alternative to static locations or manually adding things to the catalog.
 *
 * @public
 */

export class GitlabDiscoveryEntityProvider
  implements EntityProvider, EventSubscriber
{
  private readonly config: GitlabProviderConfig;
  private readonly integration: GitLabIntegration;
  private readonly logger: Logger;
  private readonly scheduleFn: () => Promise<void>;
  private connection?: EntityProviderConnection;

  static fromConfig(
    config: Config,
    options: {
      logger: Logger;
      schedule?: TaskRunner;
      scheduler?: PluginTaskScheduler;
    },
  ): GitlabDiscoveryEntityProvider[] {
    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    const providerConfigs = readGitlabConfigs(config);
    const integrations = ScmIntegrations.fromConfig(config).gitlab;
    const providers: GitlabDiscoveryEntityProvider[] = [];

    providerConfigs.forEach(providerConfig => {
      const integration = integrations.byHost(providerConfig.host);
      if (!integration) {
        throw new Error(
          `No gitlab integration found that matches host ${providerConfig.host}`,
        );
      }

      if (!options.schedule && !providerConfig.schedule) {
        throw new Error(
          `No schedule provided neither via code nor config for GitlabDiscoveryEntityProvider:${providerConfig.id}.`,
        );
      }

      const taskRunner =
        options.schedule ??
        options.scheduler!.createScheduledTaskRunner(providerConfig.schedule!);

      providers.push(
        new GitlabDiscoveryEntityProvider({
          ...options,
          config: providerConfig,
          integration,
          taskRunner,
        }),
      );
    });

    return providers;
  }

  /**
   * Constructs a GitlabDiscoveryEntityProvider instance.
   *
   * @param options - Configuration options including config, integration, logger, and taskRunner.
   */
  private constructor(options: {
    config: GitlabProviderConfig;
    integration: GitLabIntegration;
    logger: Logger;
    taskRunner: TaskRunner;
  }) {
    this.config = options.config;
    this.integration = options.integration;
    this.logger = options.logger.child({
      target: this.getProviderName(),
    });
    this.scheduleFn = this.createScheduleFn(options.taskRunner);
  }

  getProviderName(): string {
    return `GitlabDiscoveryEntityProvider:${this.config.id}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.scheduleFn();
  }

  /**
   * Creates a scheduled task runner for refreshing the entity provider.
   *
   * @param taskRunner - The task runner instance.
   * @returns The scheduled function.
   */
  private createScheduleFn(taskRunner: TaskRunner): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:refresh`;
      return taskRunner.run({
        id: taskId,
        fn: async () => {
          const logger = this.logger.child({
            class: GitlabDiscoveryEntityProvider.prototype.constructor.name,
            taskId,
            taskInstanceId: uuid.v4(),
          });

          try {
            await this.refresh(logger);
          } catch (error) {
            logger.error(
              `${this.getProviderName()} refresh failed, ${error}`,
              error,
            );
          }
        },
      });
    };
  }

  /**
   * Performs a full scan on the GitLab instance searching for locations to be ingested
   *
   * @param logger - The logger instance for logging.
   */
  async refresh(logger: Logger): Promise<void> {
    if (!this.connection) {
      throw new Error(
        `Gitlab discovery connection not initialized for ${this.getProviderName()}`,
      );
    }
    const client = new GitLabClient({
      config: this.integration.config,
      logger: logger,
    });

    const projects = paginated<GitLabProject>(
      options => client.listProjects(options),
      {
        archived: false,
        group: this.config.group,
        page: 1,
        per_page: 50,
      },
    );

    const res: Result = {
      scanned: 0,
      matches: [],
    };

    for await (const project of projects) {
      if (!this.config.projectPattern.test(project.path_with_namespace ?? '')) {
        continue;
      }
      res.scanned++;

      if (
        this.config.skipForkedRepos &&
        project.hasOwnProperty('forked_from_project')
      ) {
        continue;
      }

      if (
        !this.config.branch &&
        this.config.fallbackBranch === '*' &&
        project.default_branch === undefined
      ) {
        continue;
      }

      const project_branch =
        this.config.branch ??
        project.default_branch ??
        this.config.fallbackBranch;

      const projectHasFile: boolean = await client.hasFile(
        project.path_with_namespace ?? '',
        project_branch,
        this.config.catalogFile,
      );

      if (projectHasFile) {
        res.matches.push(project);
      }
    }

    const locations = res.matches.map(p => this.createLocationSpec(p));
    await this.connection.applyMutation({
      type: 'full',
      entities: locations.map(location => ({
        locationKey: this.getProviderName(),
        entity: locationSpecToLocationEntity({ location }),
      })),
    });
  }

  private createLocationSpec(project: GitLabProject): LocationSpec {
    const project_branch =
      this.config.branch ??
      project.default_branch ??
      this.config.fallbackBranch;

    return {
      type: 'url',
      target: `${project.web_url}/-/blob/${project_branch}/${this.config.catalogFile}`,
      presence: 'optional',
    };
  }

  // Specifies which topics will be listened to.
  // The topics from the original GitLab events contain only the string 'gitlab'. These are caught by the GitlabEventRouter Module, who republishes them with a more specific topic 'gitlab.<event_name>'
  supportsEventTopics(): string[] {
    return [TOPIC_REPO_PUSH];
  }

  /**
   * Catch events and redirects the "gitlab.push" event to be correctly handled.
   *
   * @param event - The GitLab event.
   */
  async onEvent(event: EventParams): Promise<void> {
    this.logger.debug(`Received event from topic ${event.topic}`);

    if (event.topic !== TOPIC_REPO_PUSH) {
      return;
    }

    const payload: WebhookPushEventSchema =
      event.eventPayload as WebhookPushEventSchema;
    await this.onRepoPush(payload);
  }

  /**
   * Handles the "gitlab.push" event.
   *
   * @param event - The push event payload.
   */
  private async onRepoPush(event: WebhookPushEventSchema): Promise<void> {
    this.logger.debug({ event });

    if (!this.connection) {
      throw new Error(
        `Gitlab discovery connection not initialized for ${this.getProviderName()}`,
      );
    }
    if (
      !this.config.projectPattern.test(event.project.path_with_namespace ?? '')
    ) {
      this.logger.debug(
        `Ignoring push event for ${event.project.path_with_namespace}`,
      );
      return;
    }

    const repoName = event.project.name;
    const repoUrl = event.project.web_url;
    this.logger.debug(`Received push event for ${repoName} - ${repoUrl}`);

    const branch = this.config.branch || event.project.default_branch;

    if (!(event.ref as string).includes(branch)) {
      this.logger.debug(
        `Ignoring push event for ${repoName} - ${repoUrl} and branch ${branch}`,
      );
      return;
    }

    // Get array of added, removed or modified files from the push event
    const added = this.getFilesMatchingConfig(
      event,
      'added',
      this.config.catalogFile,
    );
    const removed = this.getFilesMatchingConfig(
      event,
      'removed',
      this.config.catalogFile,
    );
    const modified = this.getFilesMatchingConfig(
      event,
      'modified',
      this.config.catalogFile,
    );

    // Modified files will be scheduled to a refresh
    const addedEntities = this.createLocationSpecCommitedFiles(
      event.project,
      added,
    );

    const removedEntities = this.createLocationSpecCommitedFiles(
      event.project,
      removed,
    );

    if (addedEntities.length > 0 || removedEntities.length > 0) {
      await this.connection.applyMutation({
        type: 'delta',
        added: this.toDeferredEntities(
          addedEntities.map(entity => entity.target),
        ),
        removed: this.toDeferredEntities(
          removedEntities.map(entity => entity.target),
        ),
      });
    }

    if (modified.length > 0) {
      const projectBranch =
        this.config.branch ??
        event.project.default_branch ??
        this.config.fallbackBranch;

      // scheduling a refresh to both tree and blob (https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)
      await this.connection.refresh({
        keys: [
          ...modified.map(
            filePath =>
              `url:${event.project.web_url}/-/tree/${projectBranch}/${filePath}`,
          ),
          ...modified.map(
            filePath =>
              `url:${event.project.web_url}/-/blob/${projectBranch}/${filePath}`,
          ),
        ],
      });
    }

    this.logger.info(
      `Processed GitLab push event from ${event.project.web_url}: added ${added.length} - removed ${removed.length} - modified ${modified.length}`,
    );
  }

  /**
   * Gets files matching the specified commit action and catalog file name.
   *
   * @param event - The push event payload.
   * @param action - The action type ('added', 'removed', or 'modified').
   * @param catalogFile - The catalog file name.
   * @returns An array of file paths.
   */
  private getFilesMatchingConfig(
    event: WebhookPushEventSchema,
    action: 'added' | 'removed' | 'modified',
    catalogFile: string,
  ): string[] {
    if (!event.commits) {
      return [];
    }
    return event.commits.flatMap((element: any) =>
      element[action].filter(
        (file: string) => path.basename(file) === catalogFile,
      ),
    );
  }

  /**
   * Creates Backstage location specs for committed files.
   *
   * @param project - The GitLab project information.
   * @param addedFiles - The array of added file paths.
   * @returns An array of location specs.
   */
  private createLocationSpecCommitedFiles(
    project: WebhookProjectSchema,
    addedFiles: string[],
  ): LocationSpec[] {
    this.logger.debug(project);
    const projectBranch =
      this.config.branch ??
      project.default_branch ??
      this.config.fallbackBranch;

    // Filters added files that match the catalog file pattern
    const matchingFiles = addedFiles.filter(
      file => path.basename(file) === this.config.catalogFile,
    );

    // Creates a location spec for each matching file
    const locationSpecs: LocationSpec[] = matchingFiles.map(file => ({
      type: 'url',
      target: `${project.web_url}/-/blob/${projectBranch}/${file}`,
      presence: 'optional',
    }));

    return locationSpecs;
  }

  /**
   * Converts a target URL to a LocationSpec object.
   *
   * @param {string} target - The target URL to be converted.
   * @returns {LocationSpec} The LocationSpec object representing the URL.
   */
  private toLocationSpec(target: string): LocationSpec {
    return {
      type: 'url',
      target: target,
      presence: 'optional',
    };
  }

  private toDeferredEntities(targets: string[]): DeferredEntity[] {
    return targets
      .map(target => {
        const location = this.toLocationSpec(target);

        return locationSpecToLocationEntity({ location });
      })
      .map(entity => {
        return {
          locationKey: this.getProviderName(),
          entity: entity,
        };
      });
  }
}
