import { HOME_FILE_TYPES } from '../../../constants'


export const homeFilesListSelector = (state) => state.home.files[HOME_FILE_TYPES.PRIVATE].files
export const homeFilesIsFetchingSelector = (state) => state.home.files[HOME_FILE_TYPES.PRIVATE].isFetching
export const homeFilesIsCheckedAllSelector = (state) => state.home.files[HOME_FILE_TYPES.PRIVATE].isCheckedAll
export const homeFilesFiltersSelector = (state) => state.home.files[HOME_FILE_TYPES.PRIVATE].filters
export const homePathSelector = (state) => state.home.files[HOME_FILE_TYPES.PRIVATE].path

export const homeFilesFeaturedListSelector = (state) => state.home.files[HOME_FILE_TYPES.FEATURED].files
export const homeFilesFeaturedIsFetchingSelector = (state) => state.home.files[HOME_FILE_TYPES.FEATURED].isFetching
export const homeFilesFeaturedIsCheckedAllSelector = (state) => state.home.files[HOME_FILE_TYPES.FEATURED].isCheckedAll
export const homeFilesFeaturedFiltersSelector = (state) => state.home.files[HOME_FILE_TYPES.FEATURED].filters
export const homePathFeaturedSelector = (state) => state.home.files[HOME_FILE_TYPES.FEATURED].path

export const homeFilesEverybodyListSelector = (state) => state.home.files[HOME_FILE_TYPES.EVERYBODY].files
export const homeFilesEverybodyIsFetchingSelector = (state) => state.home.files[HOME_FILE_TYPES.EVERYBODY].isFetching
export const homeFilesEverybodyIsCheckedAllSelector = (state) => state.home.files[HOME_FILE_TYPES.EVERYBODY].isCheckedAll
export const homeFilesEverybodyFiltersSelector = (state) => state.home.files[HOME_FILE_TYPES.EVERYBODY].filters
export const homePathEverybodySelector = (state) => state.home.files[HOME_FILE_TYPES.EVERYBODY].path

export const homeFilesSpacesListSelector = (state) => state.home.files[HOME_FILE_TYPES.SPACES].files
export const homeFilesSpacesIsFetchingSelector = (state) => state.home.files[HOME_FILE_TYPES.SPACES].isFetching
export const homeFilesSpacesIsCheckedAllSelector = (state) => state.home.files[HOME_FILE_TYPES.SPACES].isCheckedAll
export const homeFilesSpacesFiltersSelector = (state) => state.home.files[HOME_FILE_TYPES.SPACES].filters
export const homePathSpacesSelector = (state) => state.home.files[HOME_FILE_TYPES.SPACES].path

export const homeFilesGetFileDetails = (state) => state.home.files.fileDetails

export const homeFilesRenameModalSelector = (state) => state.home.files.renameModal
export const homeFilesCopyToSpaceModalSelector = (state) => state.home.files.copyToSpaceModal
export const homeFilesMakePublicFolderModalSelector = (state) => state.home.files.makePublicFolderModal
export const homeFilesAddFolderModalSelector = (state) => state.home.files.addFolderModal
export const homeFilesDeleteModalSelector = (state) => state.home.files.deleteModal
export const homeFilesAttachToModalSelector = (state) => state.home.files.filesAttachToModal
export const homeFilesModalSelector = (state) => state.home.files.moveModal
export const homeFilesAttachLicenseModalSelector = (state) => state.home.files.attachLicenseModal
export const homeFilesActionModalSelector = (state) => state.home.files.actionModal
export const homeFilesEditTagsModalSelector = (state) => state.home.files.editTagsModal
export const homeFilesLicenseModalSelector = (state) => state.home.files.licenseModal
export const homeFilesAcceptLicenseModalSelector = (state) => state.home.files.acceptLicenseModal
