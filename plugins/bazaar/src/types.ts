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

import { EntityRef } from '@backstage/catalog-model';

export type Member = {
  itemId: number;
  userId: string;
  joinDate?: string;
  picture?: string;
};

export type Status = 'ongoing' | 'proposed';

export type Size = 'small' | 'medium' | 'large';

export type BazaarProject = {
  name: string;
  id: number;
  entityRef?: EntityRef;
  community: string;
  status: Status;
  description: string;
  updatedAt?: string;
  membersCount: number;
  size: Size;
  startDate?: string | null;
  endDate?: string | null;
  responsible: string;
};

export type FormValues = {
  name: string;
  description: string;
  community: string;
  status: string;
  size: Size;
  startDate?: string | null;
  endDate?: string | null;
  responsible: string;
};
