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

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { Link } from './Link';
import { Route, Routes } from 'react-router';
import { act } from 'react-dom/test-utils';

describe('<Link />', () => {
  it('navigates using react-router', async () => {
    const testString = 'This is test string';
    const linkText = 'Navigate!';
    const { getByText } = render(
      wrapInTestApp(
        <Routes>
          <Link to="/test">{linkText}</Link>
          <Route path="/test" element={<p>{testString}</p>} />
        </Routes>,
      ),
    );
    expect(() => getByText(testString)).toThrow();
    expect(getByText(linkText, { selector: 'a' })).not.toHaveAttribute(
      'to',
      'test',
    );
    await act(async () => {
      fireEvent.click(getByText(linkText));
    });
    expect(getByText(testString)).toBeInTheDocument();
  });

  it('navigates external href with external https link', async () => {
    const linkText = 'Navigate!';
    const { getByText } = render(
      <Link to="https://backstage.io">{linkText}</Link>,
    );
    expect(getByText(linkText, { selector: 'a' })).toHaveAttribute(
      'href',
      'https://backstage.io',
    );
    expect(getByText(linkText, { selector: 'a' })).toHaveAttribute(
      'to',
      'https://backstage.io',
    );
  });

  it('navigates external href with external http link', async () => {
    const linkText = 'Navigate!';
    const { getByText } = render(
      <Link to="http://backstage.io">{linkText}</Link>,
    );
    expect(getByText(linkText, { selector: 'a' })).toHaveAttribute(
      'href',
      'http://backstage.io',
    );
    expect(getByText(linkText, { selector: 'a' })).toHaveAttribute(
      'to',
      'http://backstage.io',
    );
  });
});
