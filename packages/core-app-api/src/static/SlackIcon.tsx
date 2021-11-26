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
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';

/** @public */
export type SlackIconClassKey = 'gitlab';

const useStyles = makeStyles(
  () =>
    createStyles({
      icon: {
        pointerEvents: 'none',
      },
    }),
  { name: 'SlackIcon' },
);

const SlackIcon = () => {
  const classes = useStyles();
  return (
    <SvgIcon
      className={classes.icon}
      fill="#000000"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 172 172"
    >
      <path d="M64.5,50.16667c-4.59383,0 -31.25383,0 -35.83333,0c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333c0,7.91917 6.41417,14.33333 14.33333,14.33333c4.5795,0 31.2395,0 35.83333,0c7.91917,0 14.33333,-6.41417 14.33333,-14.33333c0,-7.91917 -6.41417,-14.33333 -14.33333,-14.33333zM78.83333,28.66667c0,4.28567 0,14.33333 0,14.33333c0,0 -10.69983,0 -14.33333,0c-7.91917,0 -14.33333,-6.41417 -14.33333,-14.33333c0,-7.91917 6.41417,-14.33333 14.33333,-14.33333c7.91917,0 14.33333,6.41417 14.33333,14.33333zM50.16667,100.33333c0,4.59383 0,31.25383 0,35.83333c0,7.91917 6.41417,14.33333 14.33333,14.33333c7.91917,0 14.33333,-6.41417 14.33333,-14.33333c0,-4.5795 0,-31.2395 0,-35.83333c0,-7.91917 -6.41417,-14.33333 -14.33333,-14.33333c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333zM28.66667,86c4.28567,0 14.33333,0 14.33333,0c0,0 0,10.69983 0,14.33333c0,7.91917 -6.41417,14.33333 -14.33333,14.33333c-7.91917,0 -14.33333,-6.41417 -14.33333,-14.33333c0,-7.91917 6.41417,-14.33333 14.33333,-14.33333zM100.33333,114.66667c4.59383,0 31.25383,0 35.83333,0c7.91917,0 14.33333,-6.41417 14.33333,-14.33333c0,-7.91917 -6.41417,-14.33333 -14.33333,-14.33333c-4.5795,0 -31.2395,0 -35.83333,0c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333c0,7.912 6.41417,14.33333 14.33333,14.33333zM86,136.16667c0,-4.28567 0,-14.33333 0,-14.33333c0,0 10.69983,0 14.33333,0c7.91917,0 14.33333,6.41417 14.33333,14.33333c0,7.91917 -6.41417,14.33333 -14.33333,14.33333c-7.91917,0 -14.33333,-6.42133 -14.33333,-14.33333zM114.66667,64.5c0,-4.59383 0,-31.25383 0,-35.83333c0,-7.91917 -6.41417,-14.33333 -14.33333,-14.33333c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333c0,4.5795 0,31.2395 0,35.83333c0,7.91917 6.41417,14.33333 14.33333,14.33333c7.912,0 14.33333,-6.42133 14.33333,-14.33333zM136.16667,78.83333c-4.28567,0 -14.33333,0 -14.33333,0c0,0 0,-10.69983 0,-14.33333c0,-7.91917 6.41417,-14.33333 14.33333,-14.33333c7.91917,0 14.33333,6.41417 14.33333,14.33333c0,7.91917 -6.42133,14.33333 -14.33333,14.33333z" />
    </SvgIcon>
  );
};

export default SlackIcon;
