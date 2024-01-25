/*
 * Copyright 2024 The Backstage Authors
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
 * NOTE: This class is auto generated, do not edit the class manually.
 */

/**
 * A link to external information that is related to the entity.
 */
export interface EntityLink {
  /**
   * An optional value to categorize links into specific groups
   */
  type?: string;
  /**
   * An optional semantic key that represents a visual icon.
   */
  icon?: string;
  /**
   * An optional descriptive title for the link.
   */
  title?: string;
  /**
   * The url to the external site, document, etc.
   */
  url: string;
}
