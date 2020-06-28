import React, { useEffect, useRef } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';
import { generatePageId } from '@yi-note/common/utils';
import SupportExtension from './SupportExtension';
import NoteItem from './NoteItem';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Tags from './Tags';
import ScrollableList from '../../components/ScrollableList';
import Spinner from '../../components/Spinner';
import { useLoadScreenshots } from '../../hooks';

export const StyledEditorContainer = styled.div`
  height: 70px;
`;

export const StyledTitle = styled.div`
  font-weight: 500;
`;

const NotesView = () => {
  const { t } = useTranslation(['notesView', 'bookmark']);
  const {
    page: {
      data: { id, notes, meta, tags }
    },
    app: { url }
  } = useStoreState(state => state);
  const {
    page: { fetchPage, bookmarkPage }
  } = useStoreActions(actions => actions);
  const tryLoadMeta = useRef(false);
  const { loading } = useLoadScreenshots();

  useEffect(() => {
    if (!id) {
      const pageId = generatePageId(url);
      fetchPage(pageId);
    } else if (
      (!meta || !meta.description || !meta.image) &&
      !tryLoadMeta.current
    ) {
      // Try add more meta info for migrated data
      tryLoadMeta.current = true;
      bookmarkPage();
    }
  }, [id, fetchPage, url, meta, bookmarkPage]);

  return (
    <>
      <Grid container spacing={2} direction="column" justify="flex-start">
        <Grid item>
          <Editor />
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <StyledTitle>{t('title')}</StyledTitle>
          </Grid>
          <Grid item>
            <Toolbar />
          </Grid>
        </Grid>
        {tags.length !== 0 && (
          <Grid item>
            <Tags />
          </Grid>
        )}
      </Grid>
      {loading ? (
        <Spinner />
      ) : (
        <ScrollableList
          items={notes}
          renderItem={note => <NoteItem note={note} />}
        />
      )}
      <SupportExtension />
    </>
  );
};

export default NotesView;
