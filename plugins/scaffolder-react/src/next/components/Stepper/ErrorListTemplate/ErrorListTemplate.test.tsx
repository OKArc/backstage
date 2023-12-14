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
import React from 'react';
import { ErrorListTemplate } from './ErrorListTemplate';
import { renderInTestApp } from '@backstage/test-utils';
import { ErrorListProps } from '@rjsf/utils';

describe('Error List Template', () => {
  const errorList = {
    errors: [
      {
        stack: 'Test error 1',
      },
      {
        stack: 'Test error 2',
      },
    ],
    errorSchema: {},
  } as Partial<ErrorListProps> as ErrorListProps;

  it('should render the error messages', async () => {
    const { getByText } = await renderInTestApp(
      <ErrorListTemplate {...errorList} />,
    );

    for (const error of errorList.errors) {
      expect(getByText(error.stack)).toBeInTheDocument();
    }
  });
});
