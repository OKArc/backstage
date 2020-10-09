/*
 * Copyright 2020 Spotify AB
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
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { TemplateEntityV1alpha1 } from '@backstage/catalog-model';
import { parseLocationAnnotation } from '../helpers';
import { InputError } from '@backstage/backend-common';
import { PreparerBase } from './types';
import GitUriParser from 'git-url-parse';
import { Clone, Cred } from 'nodegit';

export class GithubPreparer implements PreparerBase {
  token?: string;

  constructor(params: { token?: string } = {}) {
    this.token = params.token;
  }

  async prepare(template: TemplateEntityV1alpha1): Promise<string> {
    const { protocol, location } = parseLocationAnnotation(template);
    const { token } = this;

    if (protocol !== 'github') {
      throw new InputError(
        `Wrong location protocol: ${protocol}, should be 'github'`,
      );
    }
    const templateId = template.metadata.name;

    const parsedGitLocation = GitUriParser(location);
    const repositoryCheckoutUrl = parsedGitLocation.toString('https');
    const tempDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), templateId),
    );

    const templateDirectory = path.join(
      `${path.dirname(parsedGitLocation.filepath)}`,
      template.spec.path ?? '.',
    );

    const cloneOptions = token
      ? {
          fetchOpts: {
            callbacks: {
              credentials() {
                return Cred.userpassPlaintextNew(token, 'x-oauth-basic');
              },
            },
          },
        }
      : {};

    const repository = await Clone.clone(
      repositoryCheckoutUrl,
      tempDir,
      cloneOptions,
    );
    const currentBranch = await repository.getCurrentBranch();

    const references = await repository.getReferences();

    const target = references.find(
      reference => reference.shorthand() === `origin/${parsedGitLocation.ref}`,
    );

    if (target && currentBranch !== target) {
      await repository.checkoutBranch(target);
    }

    return path.resolve(tempDir, templateDirectory);
  }
}
