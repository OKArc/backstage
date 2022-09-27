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
import React, { useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import { Progress, InfoCard } from '@backstage/core-components';

import { InfoCardHeader } from '../InfoCardHeader';
import { PullRequestBoardOptions } from '../PullRequestBoardOptions';
import { Wrapper } from '../Wrapper';
import { PullRequestCard } from '../PullRequestCard';
import { usePullRequestsByTeam } from '../../hooks/usePullRequestsByTeam';
import { PRCardFormating } from '../../utils/types';
import { DraftPrIcon } from '../icons/DraftPr';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import { useUserRepositories } from '../../hooks/useUserRepositories';

/** @public */
export interface EntityTeamPullRequestsCardProps {
  pullRequestLimit?: number;
}

const EntityTeamPullRequestsCard = (props: EntityTeamPullRequestsCardProps) => {
  const { pullRequestLimit } = props;
  const [infoCardFormat, setInfoCardFormat] = useState<PRCardFormating[]>([]);
  const { repositories } = useUserRepositories();
  const { loading, pullRequests, refreshPullRequests } = usePullRequestsByTeam(
    repositories,
    pullRequestLimit,
  );

  const header = (
    <InfoCardHeader onRefresh={refreshPullRequests}>
      <PullRequestBoardOptions
        onClickOption={newFormats => setInfoCardFormat(newFormats)}
        value={infoCardFormat}
        options={[
          {
            icon: <DraftPrIcon />,
            value: 'draft',
            ariaLabel: 'Show draft PRs',
          },
          {
            icon: <UnarchiveIcon />,
            value: 'archivedRepo',
            ariaLabel: 'Show archived repos',
          },
          {
            icon: <FullscreenIcon />,
            value: 'fullscreen',
            ariaLabel: 'Info card is set to fullscreen',
          },
        ]}
      />
    </InfoCardHeader>
  );

  const getContent = () => {
    if (loading) {
      return <Progress />;
    }

    return (
      <Grid container spacing={2}>
        {pullRequests.length ? (
          pullRequests.map(({ title: columnTitle, content }) => (
            <Wrapper
              key={columnTitle}
              fullscreen={infoCardFormat.includes('fullscreen')}
            >
              <Typography variant="overline">{columnTitle}</Typography>
              {content.map(
                (
                  {
                    id,
                    title,
                    createdAt,
                    lastEditedAt,
                    author,
                    url,
                    latestReviews,
                    repository,
                    isDraft,
                  },
                  index,
                ) =>
                  infoCardFormat.includes('draft') === isDraft &&
                  infoCardFormat.includes('archivedRepo') ===
                    repository.isArchived && (
                    <PullRequestCard
                      key={`pull-request-${id}-${index}`}
                      title={title}
                      createdAt={createdAt}
                      updatedAt={lastEditedAt}
                      author={author}
                      url={url}
                      reviews={latestReviews.nodes}
                      repositoryName={repository.name}
                      repositoryIsArchived={repository.isArchived}
                      isDraft={isDraft}
                    />
                  ),
              )}
            </Wrapper>
          ))
        ) : (
          <Typography variant="overline">No pull requests found</Typography>
        )}
      </Grid>
    );
  };

  return <InfoCard title={header}>{getContent()}</InfoCard>;
};

export default EntityTeamPullRequestsCard;
