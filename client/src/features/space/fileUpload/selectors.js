import { createSelector } from '@reduxjs/toolkit'


export const fileUploadSelector = (state) => state.spaces.fileUpload

export const resourceTypeModalShownSelector = createSelector(
  fileUploadSelector,
  fileUpload => fileUpload.selectResourceTypeModalShown,
)

export const resourceTypeSelector = createSelector(
  fileUploadSelector,
  fileUpload => fileUpload.resourceType,
)

export const uploadModalShownSelector = createSelector(
  fileUploadSelector,
  fileUpload => fileUpload.uploadModalShown,
)

export const uploadModalFilesSelector = createSelector(
  fileUploadSelector,
  fileUpload => fileUpload.files,
)

