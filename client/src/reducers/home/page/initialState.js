import { HOME_TABS } from '../../../constants'


const countersState = {
  files: null,
  apps: null,
  databases: null,
  assets: null,
  workflows: null,
  jobs: null,
  isFetched: false,
}

export default {
  currentTab: null,
  currentPage: null,
  accessibleSpaces: [],
  accessibleLicense: [],
  counters: {
    [HOME_TABS.PRIVATE]: countersState,
    [HOME_TABS.FEATURED]: countersState,
    [HOME_TABS.EVERYBODY]: countersState,
    [HOME_TABS.SPACES]: countersState,
  },
  adminStatus: false,
  attachingItems: {
    isLoading: false,
    items: [],
  },
  isLeftMenuOpen: true,
}
