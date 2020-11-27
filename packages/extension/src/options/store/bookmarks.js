import { action, thunk, thunkOn } from 'easy-peasy';
import { storage as StorageService } from '@yi-note/common/services';

const storage = StorageService.getStorage();

export default {
  bookmarks: [],
  tags: [],
  setBookmarks: action((state, payload) => {
    state.bookmarks = [
      ...payload.sort((b1, b2) => b1.createdAt - b2.createdAt)
    ];
  }),
  setBookmark: action((state, payload) => {
    const { id } = payload;
    state.bookmarks = state.bookmarks.map(bookmark => {
      if (bookmark.id === id) {
        return { ...bookmark, ...payload };
      }
      return bookmark;
    });
  }),
  setTags: action((state, payload) => {
    state.tags = [...payload];
  }),
  selectTag: action((state, payload) => {
    state.tags = state.tags.map(tag => {
      if (tag.tag === payload) {
        tag.selected = !tag.selected;
        return tag;
      }
      return tag;
    });
  }),
  unSelectTags: action(state => {
    state.tags = state.tags.map(tag => {
      tag.selected = false;
      return tag;
    });
  }),
  fetchBookmarks: thunk(async actions => {
    const bookmarks = await storage.getBookmarks();
    actions.setBookmarks(bookmarks);
  }),
  removeBookmark: thunk(async (actions, pageId, { getState }) => {
    await storage.removePage(pageId);
    const { bookmarks } = getState();
    actions.setBookmarks(bookmarks.filter(bookmark => bookmark.id !== pageId));
  }),
  fetchTags: thunk(async (actions, tagsFromUrl) => {
    let tags = await storage.getTags();
    tags = tags.map(tag => {
      if (tagsFromUrl.includes(tag)) {
        return { tag, selected: true };
      }
      return { tag, selected: false };
    });
    actions.setTags(tags);
  }),
  toolbar: {
    exporting: false,
    setExporting: action((state, payload) => {
      state.exporting = payload;
    }),
    filtering: true,
    setFiltering: action((state, payload) => {
      state.filtering = payload;
    }),
    exportFormat: 'json',
    setExportFormat: action((state, payload) => {
      state.exportFormat = payload;
    })
  },
  reset: action(state => {
    state.bookmarks = [];
  }),
  onTagsChange: thunkOn(
    actions => [actions.setTags, actions.selectTag, actions.unSelectTags],
    async (actions, _, { getState }) => {
      const { tags = [] } = getState();
      const selectedTags = tags
        .filter(({ selected }) => !!selected)
        .map(({ tag }) => tag);
      const bookmarks = await storage.filterBookmarksByTags(selectedTags);
      actions.setBookmarks(bookmarks);
    }
  )
};
