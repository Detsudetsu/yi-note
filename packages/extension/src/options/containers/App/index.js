import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useStoreState, useStoreActions } from 'easy-peasy';
import styled from 'styled-components';
import { Container, Grid, LinearProgress } from '@material-ui/core';
import Header from './Header';
import Drawer from './Drawer';
import Snackbar from './Snackbar';
import Bookmarks from '../Bookmarks';
import Page from '../Page';
import Settings from '../Settings';
import { Alerts } from '@yi-note/common/components';
import { withTheme } from '@yi-note/common';
import { headerHeight, drawerWidth } from './constants';

const StyledPageContainer = styled(Container)`
  margin-top: ${headerHeight + 10}px;
  @media (min-width: 600px) {
    margin-left: ${drawerWidth}px;
    width: calc(100% - ${drawerWidth}px);
  }
`;

const StyledProgress = styled(LinearProgress)`
  width: 100%;
`;

const App = () => {
  const history = useHistory();
  const { progress } = useStoreState(state => state.app);
  const {
    settings: { fetchSettings }
  } = useStoreActions(actions => actions);

  useEffect(() => {
    browser.runtime.onMessage.addListener(message => {
      const { action, data } = message;
      switch (action) {
        case 'open-page':
          history.push(`/pages/${data}`);
          return true;
        case 'filter-by-tags':
          history.push(`/?tags=${data.join(',')}`);
          return true;
      }
    });
  }, [history]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <>
      <Header />
      <Drawer />
      <StyledPageContainer maxWidth="lg">
        <Grid container spacing={2} direction="column">
          {progress && (
            <Grid item container>
              <StyledProgress color="secondary" />
            </Grid>
          )}
          <Grid item>
            <Switch>
              <Route exact path={'/'} component={Bookmarks} />
              <Route exact path={'/settings'} component={Settings} />
              <Route path={'/pages/:id'} component={Page} />
            </Switch>
          </Grid>
        </Grid>
      </StyledPageContainer>
      <Alerts />
      <Snackbar />
    </>
  );
};

export default withTheme(App);
