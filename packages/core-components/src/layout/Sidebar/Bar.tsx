import { BackstageTheme } from '@backstage/theme';
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

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import React, { PropsWithChildren, useContext, useRef, useState } from 'react';

import { useContentRef } from '.';
import { sidebarConfig, SidebarContext } from './config';
import { SidebarPinStateContext } from './Page';

export type SidebarClassKey = 'root' | 'drawer' | 'drawerOpen';

const useStyles = makeStyles<BackstageTheme>(
  theme => ({
    root: {
      zIndex: 1,
      position: 'relative',
      overflow: 'visible',
      width: theme.spacing(7) + 1,
    },
    drawer: {
      display: 'flex',
      flexFlow: 'column nowrap',
      alignItems: 'flex-start',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      padding: 0,
      background: theme.palette.navigation.background,
      overflowX: 'hidden',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      width: sidebarConfig.drawerWidthClosed,
      borderRight: `1px solid #383838`,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shortest,
      }),
      '& > *': {
        flexShrink: 0,
      },
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    drawerOpen: {
      width: sidebarConfig.drawerWidthOpen,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    },
    visuallyHidden: {
      top: 0,
      position: 'absolute',
      zIndex: 2,
      transform: 'translateY(-200%)',
      '&:focus': {
        transform: 'translateY(5px)',
      },
    },
  }),
  { name: 'BackstageSidebar' },
);

enum State {
  Closed,
  Idle,
  Open,
}

type Props = {
  openDelayMs?: number;
  closeDelayMs?: number;
};

export function Sidebar(props: PropsWithChildren<Props>) {
  const {
    openDelayMs = sidebarConfig.defaultOpenDelayMs,
    closeDelayMs = sidebarConfig.defaultCloseDelayMs,
    children,
  } = props;
  const classes = useStyles();
  const isSmallScreen = useMediaQuery<BackstageTheme>(theme =>
    theme.breakpoints.down('md'),
  );
  const [state, setState] = useState(State.Closed);
  const hoverTimerRef = useRef<number>();
  const { isPinned } = useContext(SidebarPinStateContext);
  const contentRef = useContentRef();

  const focusContent = () => {
    contentRef?.current?.focus();
  };

  const handleOpen = () => {
    if (isPinned) {
      return;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = undefined;
    }
    if (state !== State.Open && !isSmallScreen) {
      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = undefined;
        setState(State.Open);
      }, openDelayMs);

      setState(State.Idle);
    }
  };

  const handleClose = () => {
    if (isPinned) {
      return;
    }
    focusContent();
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = undefined;
    }
    if (state === State.Idle) {
      setState(State.Closed);
    } else if (state === State.Open) {
      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = undefined;
        setState(State.Closed);
      }, closeDelayMs);
    }
  };

  const isOpen = (state === State.Open && !isSmallScreen) || isPinned;

  return (
    <div style={{}}>
      <Button
        onClick={focusContent}
        variant="contained"
        className={clsx(classes.visuallyHidden)}
      >
        Skip to content
      </Button>
      <div
        className={classes.root}
        onMouseEnter={handleOpen}
        onFocus={ignoreChildEvent(handleOpen)}
        onMouseLeave={handleClose}
        onBlur={ignoreChildEvent(handleClose)}
        data-testid="sidebar-root"
      >
        <SidebarContext.Provider
          value={{
            isOpen,
          }}
        >
          <div
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: isOpen,
            })}
          >
            {children}
          </div>
        </SidebarContext.Provider>
      </div>
    </div>
  );
}

function ignoreChildEvent(handlerFn: (e?: any) => void) {
  // TODO type the event
  return (event: any) => {
    const currentTarget = event?.currentTarget as HTMLElement;
    if (!currentTarget?.contains(event.relatedTarget as HTMLElement)) {
      handlerFn(event);
    }
  };
}
