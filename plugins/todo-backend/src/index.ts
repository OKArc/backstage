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

/**
 * A Backstage backend plugin that lets you browse TODO comments in your source code
 *
 * @packageDocumentation
 */

/**
 * Note that todo doesn't have standalone capabilities like badges module does.
 * Hence we are not importing 'reflect-metadata' anywhere within this package.
 */
import { Module } from '@nestjs/common';
import { TodoReader, TodoScmReader } from './lib';
import { TodoReaderService } from './service';

export * from './lib';
export * from './service';

export const injectables = {
  TodoReader: Symbol.for('TodoReader'),
};

@Module({})
export class TodoModule {
  static register({ scmReaderImpl }: { scmReaderImpl?: TodoReader }) {
    return {
      module: TodoModule,
      providers: [
        {
          provide: injectables.TodoReader,
          useValue: scmReaderImpl ?? TodoScmReader,
        },
        TodoReaderService,
      ],
    };
  }
}
