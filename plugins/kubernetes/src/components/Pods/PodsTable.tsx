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

import React, { useContext } from 'react';
import { V1Pod } from '@kubernetes/client-node';
import { PodDrawer } from './PodDrawer';
import { Table, TableColumn } from '@backstage/core-components';
import { PodNamesWithMetricsContext } from '../../hooks/PodNamesWithMetrics';
import * as columnFactories from './columns';

export const READY_COLUMNS: PodColumns = 'READY';
export const RESOURCE_COLUMNS: PodColumns = 'RESOURCE';
export type PodColumns = 'READY' | 'RESOURCE';

type PodsTablesProps = {
  pods: V1Pod[];
  extraColumns?: PodColumns[];
  customColumns?: TableColumn<V1Pod>[];
  children?: React.ReactNode;
};

export const DEFAULT_COLUMNS: TableColumn<V1Pod>[] = [
  columnFactories.createNameColumn(),
  columnFactories.createPhaseColumn(),
  columnFactories.createStatusColumn(),
];

export const READY: TableColumn<V1Pod>[] = [
  columnFactories.createContainersReadyColumn(),
  columnFactories.createTotalRestartsColumn(),
];

export const PodsTable = ({
  pods,
  extraColumns = [],
  customColumns = [],
}: PodsTablesProps) => {
  const podNamesWithMetrics = useContext(PodNamesWithMetricsContext);
  const columns: TableColumn<V1Pod>[] = [];
  if (customColumns.length) {
    columns.push(...customColumns);
  } else {
    columns.push(...DEFAULT_COLUMNS);
    if (extraColumns.includes(READY_COLUMNS)) {
      columns.push(...READY);
    }
    if (extraColumns.includes(RESOURCE_COLUMNS)) {
      const resourceColumns: TableColumn<V1Pod>[] = [
        columnFactories.createCPUUsageColumn(podNamesWithMetrics),
        columnFactories.createMemoryUsageColumn(podNamesWithMetrics),
      ];
      columns.push(...resourceColumns);
    }
  }

  const tableStyle = {
    minWidth: '0',
    width: '100%',
  };

  return (
    <div style={tableStyle}>
      <Table
        options={{ paging: true, search: false }}
        data={pods}
        columns={columns}
      />
    </div>
  );
};
