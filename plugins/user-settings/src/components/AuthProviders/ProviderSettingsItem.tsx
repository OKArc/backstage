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

import React, { useEffect, useState } from 'react';
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
} from '@material-ui/core';
import {
  ApiRef,
  SessionApi,
  SessionState,
  ProfileInfoApi,
  ProfileInfo,
  useApi,
  IconComponent,
} from '@backstage/core-plugin-api';

/** @public */
export const ProviderSettingsItem = (props: {
  title: string;
  description: string;
  icon: IconComponent;
  apiRef: ApiRef<ProfileInfoApi & SessionApi>;
}) => {
  const { title, description, icon: Icon, apiRef } = props;

  const api = useApi(apiRef);
  const [signedIn, setSignedIn] = useState(false);
  const [profileEmail, setProfileEmail] = useState('');

  useEffect(() => {
    let didCancel = false;

    const subscription = api
      .sessionState$()
      .subscribe((sessionState: SessionState) => {
        if (!didCancel) {
          api
            .getProfile({ optional: true })
            .then((profile: ProfileInfo | undefined) => {
              if (sessionState === SessionState.SignedIn) {
                setSignedIn(true);
              } else {
                setSignedIn(profile !== undefined);
              }
              setProfileEmail(profile?.email ?? '');
            });
        }
      });

    return () => {
      didCancel = true;
      subscription.unsubscribe();
    };
  }, [api]);

  return (
    <ListItem>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText
        primary={title}
        secondary={
          <Tooltip placement="top" arrow title={description}>
            <span>
              {description}. Signed in as {profileEmail}
            </span>
          </Tooltip>
        }
        secondaryTypographyProps={{ noWrap: true, style: { width: '80%' } }}
      />
      <ListItemSecondaryAction>
        <Tooltip
          placement="top"
          arrow
          title={signedIn ? `Sign out from ${title}` : `Sign in to ${title}`}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => (signedIn ? api.signOut() : api.signIn())}
          >
            {signedIn ? `Sign out` : `Sign in`}
          </Button>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
