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
import React from 'react';
import { VerticalIcon } from './VerticalIcon';
import { SubHeaderLink } from '../types';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  links: {
    margin: theme.spacing(2, 0),
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'min-content',
    gridGap: theme.spacing(3),
  },
}));

type Props = {
  links: SubHeaderLink[];
};

export const SubHeader = ({ links }: Props) => {
  const classes = useStyles();
  return (
    <nav className={classes.links}>
      {links.map(link => (
        <VerticalIcon
          key={link.title}
          label={link.title}
          href={link.href ?? '#'}
          action={link.action}
          icon={link.icon}
        />
      ))}
    </nav>
  );
};
