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
import React from 'react';

import { IContainer, IContainerStatus } from 'kubernetes-models/v1';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@material-ui/core';

import { DateTime } from 'luxon';

import { PodLogContext, PodLogsDialog } from '../PodLogs';
import { StructuredMetadataTable } from '@backstage/core-components';

const getContainerHealthChecks = (
  containerSpec: IContainer,
  containerStatus: IContainerStatus,
): { [key: string]: boolean } => {
  if (containerStatus.state?.terminated?.reason === 'Completed') {
    return {
      'not waiting to start': containerStatus.state?.waiting === undefined,
      'no restarts': containerStatus.restartCount === 0,
    };
  }
  return {
    'not waiting to start': containerStatus.state?.waiting === undefined,
    started: !!containerStatus.started,
    ready: containerStatus.ready,
    'no restarts': containerStatus.restartCount === 0,
    'readiness probe set':
      containerSpec && containerSpec?.readinessProbe !== undefined,
  };
};

const getCurrentState = (containerStatus: IContainerStatus): string => {
  return (
    containerStatus.state?.waiting?.reason ||
    containerStatus.state?.terminated?.reason ||
    (containerStatus.state?.running !== undefined ? 'Running' : 'Unknown')
  );
};

const getStartedAtTime = (
  containerStatus: IContainerStatus,
): string | undefined => {
  return (
    containerStatus.state?.running?.startedAt ||
    containerStatus.state?.terminated?.startedAt
  );
};

interface ContainerDatetimeProps {
  prefix: string;
  dateTime: string;
}

const ContainerDatetime = ({ prefix, dateTime }: ContainerDatetimeProps) => {
  return (
    <Typography variant="subtitle2">
      {prefix}:{' '}
      {DateTime.fromISO(dateTime).toRelative({
        locale: 'en',
      })}
    </Typography>
  );
};

export interface ContainerCardProps {
  logContext: PodLogContext;
  containerSpec?: IContainer;
  containerStatus: IContainerStatus;
}

export const ContainerCard: React.FC<ContainerCardProps> = ({
  logContext,
  containerSpec,
  containerStatus,
}: ContainerCardProps) => {
  // This should never be undefined
  if (containerSpec === undefined) {
    return <Typography>error reading pod from cluster</Typography>;
  }
  const containerStartedTime = getStartedAtTime(containerStatus);
  const containerFinishedTime = containerStatus.state?.terminated?.finishedAt;

  return (
    <Card>
      <CardHeader
        title={containerStatus.name}
        subheader={containerStatus.image}
      />
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            {containerStartedTime && (
              <ContainerDatetime
                prefix="Started"
                dateTime={containerStartedTime}
              />
            )}
            {containerFinishedTime && (
              <ContainerDatetime
                prefix="Completed"
                dateTime={containerFinishedTime}
              />
            )}
            {containerStartedTime && containerFinishedTime && (
              <Typography variant="subtitle2">
                Execution time:{' '}
                {DateTime.fromISO(containerFinishedTime)
                  .diff(DateTime.fromISO(containerStartedTime), [
                    'hours',
                    'minutes',
                    'seconds',
                  ])
                  .toHuman()}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">
              Status: {getCurrentState(containerStatus)}
            </Typography>
          </Grid>
          {containerStatus.restartCount > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                Restarts: {containerStatus.restartCount}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="subtitle2">Container health</Typography>
          </Grid>
          <Grid item xs={12}>
            <StructuredMetadataTable
              metadata={getContainerHealthChecks(
                containerSpec,
                containerStatus,
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <PodLogsDialog
          logContext={{
            containerName: containerStatus.name,
            ...logContext,
          }}
        />
      </CardActions>
    </Card>
  );
};
