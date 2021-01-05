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

import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Grid,
  Typography,
} from '@material-ui/core';
import { Config } from '@backstage/config';
import {
  configApiRef,
  Content,
  Page,
  Progress,
  StatusError,
  StatusOK,
  useApi,
} from '@backstage/core';
import { Entity } from '@backstage/catalog-model';
import { kubernetesApiRef } from '../../api/types';
import {
  KubernetesRequestBody,
  ClusterObjects,
  FetchResponse,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-backend';
import { kubernetesAuthProvidersApiRef } from '../../kubernetes-auth-provider/types';
import { DeploymentResources } from '../../types/types';
import {
  ExtensionsV1beta1Ingress,
  V1ConfigMap,
  V1Service,
} from '@kubernetes/client-node';
import { ErrorPanel } from './ErrorPanel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DeploymentsAccordions } from '../DeploymentsAccordions';

interface GroupedResponses extends DeploymentResources {
  services: V1Service[];
  configMaps: V1ConfigMap[];
  ingresses: ExtensionsV1beta1Ingress[];
}

// TODO this could probably be a lodash groupBy
const groupResponses = (fetchResponse: FetchResponse[]): GroupedResponses => {
  return fetchResponse.reduce(
    (prev, next) => {
      switch (next.type) {
        case 'deployments':
          prev.deployments.push(...next.resources);
          break;
        case 'pods':
          prev.pods.push(...next.resources);
          break;
        case 'replicasets':
          prev.replicaSets.push(...next.resources);
          break;
        case 'services':
          prev.services.push(...next.resources);
          break;
        case 'configmaps':
          prev.configMaps.push(...next.resources);
          break;
        case 'horizontalpodautoscalers':
          prev.horizontalPodAutoscalers.push(...next.resources);
          break;
        case 'ingresses':
          prev.ingresses.push(...next.resources);
          break;
        default:
      }
      return prev;
    },
    {
      pods: [],
      replicaSets: [],
      deployments: [],
      services: [],
      configMaps: [],
      horizontalPodAutoscalers: [],
      ingresses: [],
    } as GroupedResponses,
  );
};

type KubernetesContentProps = { entity: Entity; children?: React.ReactNode };

export const KubernetesContent = ({ entity }: KubernetesContentProps) => {
  const kubernetesApi = useApi(kubernetesApiRef);

  const [kubernetesObjects, setKubernetesObjects] = useState<
    ObjectsByEntityResponse | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const configApi = useApi(configApiRef);
  const clusters: Config[] = configApi.getConfigArray('kubernetes.clusters');
  const allAuthProviders: string[] = clusters.map(c =>
    c.getString('authProvider'),
  );
  const authProviders: string[] = [...new Set(allAuthProviders)];

  const kubernetesAuthProvidersApi = useApi(kubernetesAuthProvidersApiRef);

  useEffect(() => {
    (async () => {
      // For each auth type, invoke decorateRequestBodyForAuth on corresponding KubernetesAuthProvider
      let requestBody: KubernetesRequestBody = {
        entity,
      };
      for (const authProviderStr of authProviders) {
        // Multiple asyncs done sequentially instead of all at once to prevent same requestBody from being modified simultaneously
        requestBody = await kubernetesAuthProvidersApi.decorateRequestBodyForAuth(
          authProviderStr,
          requestBody,
        );
      }

      // TODO: Add validation on contents/format of requestBody
      kubernetesApi
        .getObjectsByEntity(requestBody)
        .then(result => {
          setKubernetesObjects(result);
        })
        .catch(e => {
          setError(e.message);
        });
    })();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [entity.metadata.name, kubernetesApi, kubernetesAuthProvidersApi]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const clustersWithErrors =
    kubernetesObjects?.items.filter(r => r.errors.length > 0) ?? [];

  return (
    <Page themeId="tool">
      <Content>
        <Grid container spacing={3} direction="column">
          {kubernetesObjects === undefined && error === undefined && (
            <Progress />
          )}

          {/* errors retrieved from the kubernetes clusters */}
          {clustersWithErrors.length > 0 && (
            <ErrorPanel
              entityName={entity.metadata.name}
              clustersWithErrors={clustersWithErrors}
            />
          )}

          {/* other errors */}
          {error !== undefined && (
            <ErrorPanel
              entityName={entity.metadata.name}
              errorMessage={error}
            />
          )}

          {kubernetesObjects?.items.map((item, i) => (
            <Grid item key={i}>
              <Cluster clusterObjects={item} />
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};

type ClusterProps = {
  clusterObjects: ClusterObjects;
  children?: React.ReactNode;
};

const Cluster = ({ clusterObjects }: ClusterProps) => {
  const groupedResponses = groupResponses(clusterObjects.resources);

  // TODO implement
  const podsWithErrors = [];

  return (
    <>
      <Accordion defaultExpanded TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <ClusterSummary
            clusterName={clusterObjects.cluster.name}
            totalNumberOfPods={groupedResponses.pods.length}
            numberOfPodsWithErrors={podsWithErrors.length}
          />
        </AccordionSummary>
        <AccordionDetails>
          <DeploymentsAccordions deploymentResources={groupedResponses} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

type ClusterSummaryProps = {
  clusterName: string;
  totalNumberOfPods: number;
  numberOfPodsWithErrors: number;
  children?: React.ReactNode;
};

const ClusterSummary = ({
  clusterName,
  totalNumberOfPods,
  numberOfPodsWithErrors,
}: ClusterSummaryProps) => {
  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
    >
      <Grid
        xs={2}
        item
        container
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
        spacing={0}
      >
        <Grid item xs>
          <Typography variant="h3">{clusterName}</Typography>
        </Grid>
        <Grid item xs>
          <Typography color="textSecondary" variant="body1">
            Cluster
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={1}>
        {/* TODO move style to class */}
        <Divider style={{ height: '4em' }} orientation="vertical" />
      </Grid>
      <Grid
        item
        container
        xs={3}
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item>
          <StatusOK>{totalNumberOfPods} pods</StatusOK>
        </Grid>
        <Grid item>
          {numberOfPodsWithErrors > 0 ? (
            <StatusError>{numberOfPodsWithErrors} pods with errors</StatusError>
          ) : (
            <StatusOK>No pods with errors</StatusOK>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
