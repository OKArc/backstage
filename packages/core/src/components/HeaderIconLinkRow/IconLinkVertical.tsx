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
import classnames from 'classnames';
import { makeStyles, Link } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import { Link as RouterLink } from '../Link';

export type IconLinkVerticalProps = {
  key?: React.Key;
  icon?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  disabled?: boolean;
  label: string;
  testId?: string;
  color?: 'primary' | 'secondary';
};

const useIconStyles = makeStyles(theme => ({
  link: {
    display: 'grid',
    justifyItems: 'center',
    gridGap: 4,
    textAlign: 'center',
  },
  disabled: {
    color: 'gray',
  },
  primary: {
    color: theme.palette.primary.main,
  },
  secondary: {
    color: theme.palette.secondary.main,
  },
  label: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: 1.2,
  },
}));

export function IconLinkVertical({
  icon = <LinkIcon />,
  href = '#',
  disabled = false,
  color = 'primary',
  label,
  testId,
  onClick,
}: IconLinkVerticalProps) {
  const classes = useIconStyles();

  if (disabled) {
    return (
      <Link
        data-testid={testId}
        className={classnames(classes.link, classes.disabled)}
        underline="none"
      >
        {icon}
        <span className={classes.label}>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      data-testid={testId}
      className={classnames(classes.link, classes[color])}
      to={href}
      component={RouterLink}
      onClick={onClick}
    >
      {icon}
      <span className={classes.label}>{label}</span>
    </Link>
  );
}
