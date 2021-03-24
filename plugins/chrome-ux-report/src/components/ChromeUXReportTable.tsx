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
import React from 'react';
import {
  Table,
  TableColumn,
  useApi,
  Progress
} from '@backstage/core';
import { chromeuxReportApiRef } from "../api";
import { useAsync } from "react-use";
import Alert from "@material-ui/lab/Alert";

const returnRoundOfMetric = (metric: any) => {
  return Math.round(metric * 100);
}

export const ChromeUXReportTable = ({ origin }: { origin: string; }) => {
  const chromeUXReportApi = useApi(chromeuxReportApiRef);
  const columns: TableColumn[] = [
    {
      field: 'metricName',
      highlight: true,
    },
    {
      field: 'metricValue',
      highlight: true,
    },
    {
      title: 'FAST',
      field: 'fast',
    },
    {
      title: 'AVERAGE',
      field: 'average'
    },
    {
      title: 'SLOW',
      field: 'slow'
    }
  ];

  const { value, loading, error } = useAsync(async (): Promise<any> => {
    const response = await chromeUXReportApi.getChromeUXMetrics(origin);
    return response.metrics;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const {
    form_factor,
    connection_type,
    first_contentful_paint,
    largest_contentful_paint,
    dom_content_loaded,
    first_input,
    onload,
    layout_instability,
    time_to_first_byte
  } = value;

  return <Table
    options={{paging: false, search: false}}
    data={[{
      metricName: 'FORM FACTOR',
      metricValue: form_factor,
      fast: '-',
      average: '-',
      slow: '-'
    }, {
      metricName: 'CONNECTION TYPE',
      metricValue: connection_type,
      fast: '-',
      average: '-',
      slow: '-'
    }, {
      metricName: 'FIRST CONTENTFUL PAINT',
      metricValue: '-',
      fast: `${returnRoundOfMetric(first_contentful_paint.fast)}%`,
      average:`${returnRoundOfMetric(first_contentful_paint.average)}%`,
      slow: `${returnRoundOfMetric(first_contentful_paint.slow)}%`
    }, {
      metricName: 'LARGEST CONTENTFUL PAINT',
      metricValue: '-',
      fast: `${returnRoundOfMetric(largest_contentful_paint.fast)}%`,
      average: `${returnRoundOfMetric(largest_contentful_paint.average)}%`,
      slow: `${returnRoundOfMetric(largest_contentful_paint.slow)}%`
    }, {
      metricName: 'DOM CONTENT LOADED',
      metricValue: '-',
      fast: `${returnRoundOfMetric(dom_content_loaded.fast)}%`,
      average: `${returnRoundOfMetric(dom_content_loaded.average)}%`,
      slow: `${returnRoundOfMetric(dom_content_loaded.slow)}%`
    }, {
      metricName: 'FIRST INPUT',
      metricValue: '-',
      fast: `${returnRoundOfMetric(first_input.fast)}%`,
      average: `${returnRoundOfMetric(first_input.average)}%`,
      slow: `${returnRoundOfMetric(first_input.slow)}%`
    }, {
      metricName: 'ONLOAD',
      metricValue: '-',
      fast: `${returnRoundOfMetric(onload.fast)}%`,
      average: `${returnRoundOfMetric(onload.average)}%`,
      slow: `${returnRoundOfMetric(onload.slow)}%`
    }, {
      metricName: 'LAYOUT INSTABILITY',
      metricValue: '-',
      fast: `${returnRoundOfMetric(layout_instability.fast)}%`,
      average: `${returnRoundOfMetric(layout_instability.average)}%`,
      slow: `${returnRoundOfMetric(layout_instability.slow)}%`
    }, {
      metricName: 'TIME TO FIRST BYTE',
      metricValue: '-',
      fast: `${returnRoundOfMetric(time_to_first_byte.fast)}%`,
      average: `${returnRoundOfMetric(time_to_first_byte.average)}%`,
      slow: `${returnRoundOfMetric(time_to_first_byte.slow)}%`
    }]}
    columns={columns}
  />;
};
