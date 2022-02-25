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
import moment from 'moment';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Content,
  ContentHeader,
  Table,
  TableColumn,
  Progress,
  StatusWarning,
  StatusError,
  StatusPending,
  Select,
  EmptyState,
  Link,
} from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { periskopApiRef } from '../..';
import { AggregatedError, NotFoundInLocation } from '../../types';

/**
 * Constant storing Periskop project name.
 *
 * @public
 */
export const PERISKOP_NAME_ANNOTATION = 'periskop.io/name';

/**
 * Returns true if Periskop annotation is present in the given entity.
 *
 * @public
 */
export const isPeriskopAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[PERISKOP_NAME_ANNOTATION]);

const renderKey = (
  error: AggregatedError,
  linkTarget: string,
): React.ReactNode => {
  return (
    <Link to={linkTarget} target="_blank" rel="noreferrer">
      {error.aggregation_key}
    </Link>
  );
};

const renderSeverity = (severity: string): React.ReactNode => {
  if (severity.toLocaleLowerCase('en-US') === 'warning') {
    return <StatusWarning>{severity}</StatusWarning>;
  } else if (severity.toLocaleLowerCase('en-US') === 'error') {
    return <StatusError>{severity}</StatusError>;
  }
  return <StatusPending>{severity}</StatusPending>;
};

const renderLastOccurrence = (error: AggregatedError): React.ReactNode => {
  return moment(new Date(error.latest_errors[0].timestamp * 1000)).fromNow();
};

function isNotFoundInLocation(
  apiResult: AggregatedError[] | NotFoundInLocation | undefined,
): apiResult is NotFoundInLocation {
  return (apiResult as NotFoundInLocation)?.body !== undefined;
}

export const PeriskopErrorsTable = () => {
  const { entity } = useEntity();
  const entityPeriskopName: string =
    (entity.metadata.annotations?.[PERISKOP_NAME_ANNOTATION] as
      | string
      | undefined) ?? entity.metadata.name;

  const periskopApi = useApi(periskopApiRef);
  const locations = periskopApi.getLocationNames();
  const [locationOption, setLocationOption] = React.useState<string>(
    locations[0],
  );
  const {
    value: aggregatedErrors,
    loading,
    error,
  } = useAsync(async (): Promise<AggregatedError[] | NotFoundInLocation> => {
    return periskopApi.getErrors(locationOption, entityPeriskopName);
  }, [locationOption]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const columns: TableColumn<AggregatedError>[] = [
    {
      title: 'Key',
      field: 'aggregation_key',
      highlight: true,
      sorting: false,
      render: aggregatedError => {
        const errorUrl = periskopApi.getErrorInstanceUrl(
          locationOption,
          entityPeriskopName,
          aggregatedError,
        );
        return renderKey(aggregatedError, errorUrl);
      },
    },
    { title: 'Occurrences', field: 'total_count', sorting: true },
    {
      title: 'Last Occurrence',
      render: aggregatedError => renderLastOccurrence(aggregatedError),
      defaultSort: 'asc',
      customSort: (a, b) =>
        b.latest_errors[0].timestamp - a.latest_errors[0].timestamp,
      type: 'datetime',
    },
    {
      title: 'Severity',
      field: 'severity',
      render: aggregatedError => renderSeverity(aggregatedError.severity),
      sorting: false,
    },
  ];

  const sortingSelect = (
    <Select
      selected={locationOption}
      label="Location"
      items={locations.map(e => ({
        label: e,
        value: e,
      }))}
      onChange={el => setLocationOption(el.toString())}
    />
  );

  const contentHeader = (
    <ContentHeader title="Periskop" description={entityPeriskopName}>
      {sortingSelect}
    </ContentHeader>
  );

  if (isNotFoundInLocation(aggregatedErrors)) {
    return (
      <Content noPadding>
        {contentHeader}
        <EmptyState
          title="Periskop returned an error"
          description={aggregatedErrors.body}
          missing="data"
        />
      </Content>
    );
  }

  return (
    <Content noPadding>
      {contentHeader}
      <Table
        options={{
          search: false,
          paging: false,
          filtering: true,
          padding: 'dense',
          toolbar: false,
        }}
        columns={columns}
        data={aggregatedErrors || []}
      />
    </Content>
  );
};
