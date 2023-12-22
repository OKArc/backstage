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

import { ConfigReader } from '@backstage/config';
import {
  createOriginFilter,
  getDefaultBackstageTokenExpiryTime,
} from './router';
import { BACKSTAGE_SESSION_EXPIRATION } from '../lib/session';

describe('Auth origin filtering', () => {
  const config = new ConfigReader({
    app: {
      baseUrl: 'http://example.com/extra-path',
    },
    auth: {
      experimentalExtraAllowedOrigins: ['https://test-*.example.net'],
    },
  });

  it('Will explode, invalid origin', () => {
    const origin = 'https://test.example.net';
    expect(createOriginFilter(config)(origin)).toBeFalsy();
  });

  it('Will explode, invalid origin domain', () => {
    const origin = 'https://test-1234.examplee.net';
    expect(createOriginFilter(config)(origin)).toBeFalsy();
  });

  it("Won't explode, uses app origin", () => {
    const origin = 'http://example.com';
    expect(createOriginFilter(config)(origin)).toBeTruthy();
  });

  it("Won't explode, valid origin with numbers", () => {
    const origin = 'https://test-1234.example.net';
    expect(createOriginFilter(config)(origin)).toBeTruthy();
  });

  it("Won't explode, valid origin with chars and numbers", () => {
    const origin = 'https://test-test1234.example.net';
    expect(createOriginFilter(config)(origin)).toBeTruthy();
  });
});

describe('Test for default backstage token expiry time', () => {
  it('Will return default backstage session expiration', () => {
    const config = new ConfigReader({
      app: {
        baseUrl: 'http://example.com/extra-path',
      },
    });
    expect(getDefaultBackstageTokenExpiryTime(config)).toBe(
      BACKSTAGE_SESSION_EXPIRATION,
    );
  });

  it('Will return user defined backstage session expiration', () => {
    const config = new ConfigReader({
      app: {
        baseUrl: 'http://example.com/extra-path',
      },
      auth: {
        backstageTokenExpiration: { minutes: 120 },
      },
    });
    expect(getDefaultBackstageTokenExpiryTime(config)).toBe(7200);
  });
});
