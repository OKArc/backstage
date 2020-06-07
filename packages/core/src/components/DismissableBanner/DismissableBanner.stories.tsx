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
import DismissableBanner from './DismissableBanner';
import { Link, Typography } from '@material-ui/core';

export default {
  title: 'DismissableBanner',
  component: DismissableBanner,
};

const containerStyle = { width: '70%' };

export const Default = () => (
  <div style={containerStyle}>
    <DismissableBanner
      message="This is a dismissable banner"
      variant="info"
      id="default_dismissable"
    />
  </div>
);

export const Error = () => (
  <div style={containerStyle}>
    <DismissableBanner
      message="This is a dismissable banner with an error message"
      variant="error"
      id="error_dismissable"
    />
  </div>
);

export const EmojisIncluded = () => (
  <div style={containerStyle}>
    <DismissableBanner
      message="This is a dismissable banner with emojis: 🚀 💚 😆 "
      variant="info"
      id="emojis_dismissable"
    />
  </div>
);

export const WithLink = () => (
  <div style={containerStyle}>
    <DismissableBanner
      message={
        <Typography>
          This is a dismissable banner with a link:{' '}
          <Link href="http://example.com" color="textSecondary">
            example.com
          </Link>
        </Typography>
      }
      variant="info"
      id="linked_dismissable"
    />
  </div>
);
