/*
 * Copyright 2021 Spotify AB
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

import { Groups } from '../types';

export function getUptimeRanges() {
  const days = 30;

  const date = new Date();
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);

  const ranges = [];
  for (let i = 0; i < days; i++) {
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    const start = Math.floor(date.getTime() / 1000);

    date.setUTCHours(23);
    date.setUTCMinutes(59);
    date.setUTCSeconds(59);
    date.setUTCMilliseconds(999);
    const end = Math.floor(date.getTime() / 1000);

    ranges.push(`${start}_${end}`);

    date.setUTCDate(date.getUTCDate() - 1);
  }

  return ranges.join('-');
}

export function parseAnnotation(rawAnnotation: string): Groups {
  const splittedAnnotation = rawAnnotation.split(';');
  return splittedAnnotation.map(part => {
    const a = part.split(',');
    return {
      apiKey: a[0].replace('apiKey=', ''),
      monitors: a[1].replace('monitors=', '').split('+'),
    };
  });
}
