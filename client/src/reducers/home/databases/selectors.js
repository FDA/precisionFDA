import { HOME_DATABASE_TYPES } from '../../../constants'


export const homeDatabasesListSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.PRIVATE].databases
export const homeDatabasesIsFetchingSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.PRIVATE].isFetching
export const homeDatabasesIsCheckedAllSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.PRIVATE].isCheckedAll
export const homeDatabasesFiltersSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.PRIVATE].filters

export const homeDatabasesSpacesListSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.SPACES].databases
export const homeDatabasesSpacesIsFetchingSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.SPACES].isFetching
export const homeDatabasesSpacesIsCheckedAllSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.SPACES].isCheckedAll
export const homeDatabasesSpacesFiltersSelector = (state) => state.home.databases[HOME_DATABASE_TYPES.SPACES].filters

export const homeDatabaseDetailsSelector = (state) => state.home.databases.databaseDetails

export const homeDatabasesEditTagsModalSelector = (state) => state.home.databases.editTagsModal
export const homeDatabasesEditInfoModalSelector = (state) => state.home.databases.editDatabaseInfoModal
export const homeDatabasesRunActionModalSelector = (state) => state.home.databases.runActionModal
