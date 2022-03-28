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

export interface Config {
  /** Configuration options for the cloud-carbon-footprint-backend plugin */
  cloudCarbonFootprint: {
    /**
     * Project ID with billing export configured
     * @visibility backend
     */
    gcpBillingProjectId: string;
    /**
     * Big Query table with billing export data in format `dataset.table`
     * @visibility backend
     */
    gcpBigQueryTable: string
  };
}
