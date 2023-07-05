/*
 * Copyright 2023 The Backstage Authors
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
import {
  GraphQLNamedType,
  GraphQLOutputType,
  isListType,
  isNonNullType,
} from 'graphql';
import { NodeId } from './types';

/** @public */
export function encodeId({ source, typename, query }: NodeId): string {
  return `${typename}@${source}@${JSON.stringify(query ?? {})}`;
}

/** @public */
export function decodeId(id: string): NodeId {
  const [typename, source, ...query] = id.split('@');
  return { typename, source, query: JSON.parse(query.join('@')) };
}

/** @public */
export function unboxNamedType(type: GraphQLOutputType): GraphQLNamedType {
  if (isNonNullType(type)) {
    return unboxNamedType(type.ofType);
  }
  if (isListType(type)) {
    return unboxNamedType(type.ofType);
  }
  return type;
}
