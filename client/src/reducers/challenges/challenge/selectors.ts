
export const challengeDataSelector = (state: any) => state.challenges.challenge.data
export const challengeIsFetchingSelector = (state: any) => state.challenges.challenge.isFetching
export const challengeErrorSelector = (state: any) => state.challenges.challenge.error

export const challengeSubmissionsDataSelector = (state: any) => state.challenges.challenge.submissions.data
export const challengeSubmissionsIsFetchingSelector = (state: any) => state.challenges.challenge.submissions.isFetching
export const challengeSubmissionsErrorSelector = (state: any) => state.challenges.challenge.submissions.error

export const challengeMyEntriesDataSelector = (state: any) => state.challenges.challenge.myEntries.data
export const challengeMyEntriesIsFetchingSelector = (state: any) => state.challenges.challenge.myEntries.isFetching
export const challengeMyEntriesErrorSelector = (state: any) => state.challenges.challenge.myEntries.error
