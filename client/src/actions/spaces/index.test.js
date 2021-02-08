import {
  resetSpacesListFilters,
  searchSpacesList,
  switchListViewType,
  spaceSideMenuToggle,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  toggleFileCheckbox,
  toggleAllFileCheckboxes,
  spacesSetPage,
  hideLayoutLockModal,
  showLayoutLockModal,
  hideLayoutUnlockModal,
  showLayoutUnlockModal,
  hideLayoutDeleteModal,
  showLayoutDeleteModal,
  showFilesActionModal,
  hideFilesActionModal,
  showFilesRenameModal,
  hideFilesRenameModal,
  showSpaceAddDataModal,
  hideSpaceAddDataModal,
  showFilesCopyModal,
  hideFilesCopyModal,
  selectAccessibleSpace,
  toggleFilesAddDataCheckbox,
  toggleAllFilesAddDataCheckboxes,
  toggleAppsAddDataCheckbox,
  toggleAllAppsAddDataCheckboxes,
  toggleWorkflowsAddDataCheckbox,
  toggleAllWorkflowsAddDataCheckboxes,
  toggleAppCheckbox,
  toggleAllAppCheckboxes,
  toggleWorkflowCheckbox,
  toggleAllWorkflowCheckboxes,
  showAppsCopyModal,
  hideAppsCopyModal,
  showWorkflowsCopyModal,
  hideWorkflowsCopyModal,
  setAppsCurrentPageValue,
  setWorkflowsCurrentPageValue,
  setJobsCurrentPageValue,
  setFilesCurrentPageValue,
} from '.'
import {
  SPACES_SWITCH_LIST_VIEW_TYPE,
  SPACES_LIST_SEARCH,
  SPACES_LIST_RESET_FILTERS,
  SPACE_SIDE_MENU_TOGGLE,
  SPACE_FILES_SHOW_ADD_FOLDER_MODAL,
  SPACE_FILES_HIDE_ADD_FOLDER_MODAL,
  SPACE_FILES_TOGGLE_CHECKBOX,
  SPACE_FILES_TOGGLE_ALL_CHECKBOXES,
  SPACE_LAYOUT_HIDE_LOCK_MODAL,
  SPACE_LAYOUT_SHOW_LOCK_MODAL,
  SPACE_LAYOUT_HIDE_UNLOCK_MODAL,
  SPACE_LAYOUT_SHOW_UNLOCK_MODAL,
  SPACE_LAYOUT_HIDE_DELETE_MODAL,
  SPACE_LAYOUT_SHOW_DELETE_MODAL,
  SPACE_FILES_SHOW_ACTION_MODAL,
  SPACE_FILES_HIDE_ACTION_MODAL,
  SPACES_SET_PAGE,
  SPACE_FILES_SHOW_RENAME_MODAL,
  SPACE_FILES_HIDE_RENAME_MODAL,
  SPACE_HIDE_ADD_DATA_MODAL,
  SPACE_SHOW_ADD_DATA_MODAL,
  SPACE_FILES_SHOW_COPY_MODAL,
  SPACE_FILES_HIDE_COPY_MODAL,
  SPACE_SELECT_ACCESSIBLE_SPACE,
  SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_TOGGLE_CHECKBOX,
  SPACE_APPS_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_SHOW_COPY_MODAL,
  SPACE_APPS_HIDE_COPY_MODAL,
  SPACE_WORKFLOWS_SHOW_COPY_MODAL,
  SPACE_WORKFLOWS_HIDE_COPY_MODAL,
  SPACE_APPS_SET_CURRENT_PAGE_VALUE,
  SPACE_WORKFLOWS_SET_CURRENT_PAGE_VALUE,
  SPACE_JOBS_SET_CURRENT_PAGE_VALUE,
  SPACE_FILES_SET_CURRENT_PAGE_VALUE,
} from './types'


describe('switchListViewType()', () => {
  it('creates correct action', () => {
    const payload = 'some type'

    expect(switchListViewType(payload)).toEqual({
      type: SPACES_SWITCH_LIST_VIEW_TYPE,
      payload,
    })
  })
})

describe('searchSpacesList()', () => {
  it('creates correct action', () => {
    const payload = 'some type'

    expect(searchSpacesList(payload)).toEqual({
      type: SPACES_LIST_SEARCH,
      payload,
    })
  })
})

describe('resetSpacesListFilters()', () => {
  it('creates correct action', () => {
    expect(resetSpacesListFilters()).toEqual({
      type: SPACES_LIST_RESET_FILTERS,
      payload: {},
    })
  })
})

describe('spaceSideMenuToggle()', () => {
  it('creates correct action', () => {
    expect(spaceSideMenuToggle()).toEqual({
      type: SPACE_SIDE_MENU_TOGGLE,
      payload: {},
    })
  })
})

describe('showFilesAddFolderModal()', () => {
  it('creates correct action', () => {
    expect(showFilesAddFolderModal()).toEqual({
      type: SPACE_FILES_SHOW_ADD_FOLDER_MODAL,
      payload: {},
    })
  })
})

describe('hideFilesAddFolderModal()', () => {
  it('creates correct action', () => {
    expect(hideFilesAddFolderModal()).toEqual({
      type: SPACE_FILES_HIDE_ADD_FOLDER_MODAL,
      payload: {},
    })
  })
})

describe('toggleFileCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleFileCheckbox(123)).toEqual({
      type: SPACE_FILES_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllFileCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllFileCheckboxes()).toEqual({
      type: SPACE_FILES_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('spacesSetPage()', () => {
  it('creates correct action', () => {
    expect(spacesSetPage(123)).toEqual({
      type: SPACES_SET_PAGE,
      payload: 123,
    })
  })
})

describe('hideLayoutLockModal()', () => {
  it('creates correct action', () => {
    expect(hideLayoutLockModal()).toEqual({
      type: SPACE_LAYOUT_HIDE_LOCK_MODAL,
      payload: {},
    })
  })
})

describe('showLayoutLockModal()', () => {
  it('creates correct action', () => {
    expect(showLayoutLockModal()).toEqual({
      type: SPACE_LAYOUT_SHOW_LOCK_MODAL,
      payload: {},
    })
  })
})

describe('hideLayoutUnlockModal()', () => {
  it('creates correct action', () => {
    expect(hideLayoutUnlockModal()).toEqual({
      type: SPACE_LAYOUT_HIDE_UNLOCK_MODAL,
      payload: {},
    })
  })
})

describe('hideLayoutUnlockModal()', () => {
  it('creates correct action', () => {
    expect(hideLayoutUnlockModal()).toEqual({
      type: SPACE_LAYOUT_HIDE_UNLOCK_MODAL,
      payload: {},
    })
  })
})

describe('showLayoutUnlockModal()', () => {
  it('creates correct action', () => {
    expect(showLayoutUnlockModal()).toEqual({
      type: SPACE_LAYOUT_SHOW_UNLOCK_MODAL,
      payload: {},
    })
  })
})

describe('hideLayoutDeleteModal()', () => {
  it('creates correct action', () => {
    expect(hideLayoutDeleteModal()).toEqual({
      type: SPACE_LAYOUT_HIDE_DELETE_MODAL,
      payload: {},
    })
  })
})

describe('showLayoutDeleteModal()', () => {
  it('creates correct action', () => {
    expect(showLayoutDeleteModal()).toEqual({
      type: SPACE_LAYOUT_SHOW_DELETE_MODAL,
      payload: {},
    })
  })
})

describe('showFilesActionModal()', () => {
  const action = 'action'
  it('creates correct action', () => {
    expect(showFilesActionModal(action)).toEqual({
      type: SPACE_FILES_SHOW_ACTION_MODAL,
      payload: action,
    })
  })
})

describe('hideFilesActionModal()', () => {
  it('creates correct action', () => {
    expect(hideFilesActionModal()).toEqual({
      type: SPACE_FILES_HIDE_ACTION_MODAL,
      payload: {},
    })
  })
})

describe('showFilesRenameModal()', () => {
  it('creates correct action', () => {
    expect(showFilesRenameModal()).toEqual({
      type: SPACE_FILES_SHOW_RENAME_MODAL,
      payload: {},
    })
  })
})

describe('hideFilesRenameModal()', () => {
  it('creates correct action', () => {
    expect(hideFilesRenameModal()).toEqual({
      type: SPACE_FILES_HIDE_RENAME_MODAL,
      payload: {},
    })
  })
})

describe('showSpaceAddDataModal()', () => {
  const dataType = 'dataType'
  it('creates correct action', () => {
    expect(showSpaceAddDataModal(dataType)).toEqual({
      type: SPACE_SHOW_ADD_DATA_MODAL,
      payload: dataType,
    })
  })
})

describe('hideSpaceAddDataModal()', () => {
  it('creates correct action', () => {
    expect(hideSpaceAddDataModal()).toEqual({
      type: SPACE_HIDE_ADD_DATA_MODAL,
      payload: {},
    })
  })
})

describe('showFilesCopyModal()', () => {
  it('creates correct action', () => {
    expect(showFilesCopyModal()).toEqual({
      type: SPACE_FILES_SHOW_COPY_MODAL,
      payload: {},
    })
  })
})

describe('hideFilesCopyModal()', () => {
  it('creates correct action', () => {
    expect(hideFilesCopyModal()).toEqual({
      type: SPACE_FILES_HIDE_COPY_MODAL,
      payload: {},
    })
  })
})

describe('selectAccessibleSpace()', () => {
  const scope = 'space-1'
  it('creates correct action', () => {
    expect(selectAccessibleSpace(scope)).toEqual({
      type: SPACE_SELECT_ACCESSIBLE_SPACE,
      payload: scope,
    })
  })
})

describe('toggleFilesAddDataCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleFilesAddDataCheckbox(123)).toEqual({
      type: SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllFilesAddDataCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllFilesAddDataCheckboxes()).toEqual({
      type: SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('toggleAppsAddDataCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleAppsAddDataCheckbox(123)).toEqual({
      type: SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllAppsAddDataCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllAppsAddDataCheckboxes()).toEqual({
      type: SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('toggleWorkflowsAddDataCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleWorkflowsAddDataCheckbox(123)).toEqual({
      type: SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllWorkflowsAddDataCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllWorkflowsAddDataCheckboxes()).toEqual({
      type: SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('toggleAppCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleAppCheckbox(123)).toEqual({
      type: SPACE_APPS_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllAppCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllAppCheckboxes()).toEqual({
      type: SPACE_APPS_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('toggleWorkflowCheckbox()', () => {
  it('creates correct action', () => {
    expect(toggleWorkflowCheckbox(123)).toEqual({
      type: SPACE_WORKFLOWS_TOGGLE_CHECKBOX,
      payload: 123,
    })
  })
})

describe('toggleAllWorkflowCheckboxes()', () => {
  it('creates correct action', () => {
    expect(toggleAllWorkflowCheckboxes()).toEqual({
      type: SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
      payload: {},
    })
  })
})

describe('showAppsCopyModal()', () => {
  it('creates correct action', () => {
    expect(showAppsCopyModal()).toEqual({
      type: SPACE_APPS_SHOW_COPY_MODAL,
      payload: {},
    })
  })
})

describe('hideAppsCopyModal()', () => {
  it('creates correct action', () => {
    expect(hideAppsCopyModal()).toEqual({
      type: SPACE_APPS_HIDE_COPY_MODAL,
      payload: {},
    })
  })
})

describe('showWorkflowsCopyModal()', () => {
  it('creates correct action', () => {
    expect(showWorkflowsCopyModal()).toEqual({
      type: SPACE_WORKFLOWS_SHOW_COPY_MODAL,
      payload: {},
    })
  })
})

describe('hideWorkflowsCopyModal()', () => {
  it('creates correct action', () => {
    expect(hideWorkflowsCopyModal()).toEqual({
      type: SPACE_WORKFLOWS_HIDE_COPY_MODAL,
      payload: {},
    })
  })
})

describe('setAppsCurrentPageValue()', () => {
  it('creates correct action', () => {
    expect(setAppsCurrentPageValue(2)).toEqual({
      type: SPACE_APPS_SET_CURRENT_PAGE_VALUE,
      payload: 2,
    })
  })
})

describe('setWorkflowsCurrentPageValue()', () => {
  it('creates correct action', () => {
    expect(setWorkflowsCurrentPageValue(2)).toEqual({
      type: SPACE_WORKFLOWS_SET_CURRENT_PAGE_VALUE,
      payload: 2,
    })
  })
})

describe('setJobsCurrentPageValue()', () => {
  it('creates correct action', () => {
    expect(setJobsCurrentPageValue(2)).toEqual({
      type: SPACE_JOBS_SET_CURRENT_PAGE_VALUE,
      payload: 2,
    })
  })
})

describe('setFilesCurrentPageValue()', () => {
  it('creates correct action', () => {
    expect(setFilesCurrentPageValue(2)).toEqual({
      type: SPACE_FILES_SET_CURRENT_PAGE_VALUE,
      payload: 2,
    })
  })
})
