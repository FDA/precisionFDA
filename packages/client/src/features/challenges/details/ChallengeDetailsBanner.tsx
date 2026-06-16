import { TZDate } from '@date-fns/tz'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Link } from 'react-router'
import { Button, OutlineButton } from '@/components/Button'
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon'
import { CogsIcon } from '@/components/icons/Cogs'
import { ObjectGroupIcon } from '@/components/icons/ObjectGroupIcon'
import { PencilIcon } from '@/components/icons/PencilIcon'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { PageContainer } from '@/components/Page/page.styles'
import type { IUser } from '@/types/user'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { joinChallengeRequest } from '../api'
import type { Challenge } from '../types'
import { getChallengeTimeRemaining, getTimeStatus } from '../util'
import styles from './ChallengeDetailsBanner.module.css'
import {
  CallToActionButton,
  ChallengeDate,
  ChallengeDateArea,
  ChallengeDateLabel,
  ChallengeDateRemaining,
  ChallengeDescription,
  ChallengeName,
  ChallengeStateLabel,
  ChallengeThumbnail,
  LeftColumn,
  RightColumn,
  StartEnd,
  StyledChallengeDetailsBanner,
} from './challenges-details.styles'
import { useSubmitChallengeModal } from './SubmitChallengeModal'

export const ChallengeDetailsBanner = ({ challenge, user }: { challenge: Challenge; user?: IUser }) => {
  const isLoggedIn = !!user?.id
  const timeStatus = getTimeStatus(challenge.startAt, challenge.endAt)
  let stateLabel = 'Previous precisionFDA Challenge'
  switch (timeStatus) {
    case 'upcoming':
      stateLabel = 'Upcoming precisionFDA Challenge'
      break
    case 'current':
      stateLabel = 'Current precisionFDA Challenge'
      break
    default:
      break
  }
  const userCanSubmitEntry = isLoggedIn && challenge.follows && timeStatus === 'current' && challenge.status === 'open'
  const userCanJoin = isLoggedIn && !challenge.follows && timeStatus === 'current' && challenge.status === 'open'

  const hasJoined = challenge.follows

  const challengePreRegistration = challenge.status === 'pre-registration'

  const onClickPreRegistrationButton = () => {
    if (challenge.preRegistrationUrl) {
      if (window) {
        window.open(challenge.preRegistrationUrl || '#', '_blank')!.focus()
      }
    }
  }

  const queryClient = useQueryClient()
  const joinMutation = useMutation<void, AxiosError<{ error?: string }>>({
    mutationFn: () => joinChallengeRequest(challenge.id),
    onSuccess: () => {
      toastSuccess(
        'You are now following the challenge! If you would like to participate please submit an entry by the deadline.',
      )
      queryClient.invalidateQueries({ queryKey: ['challenge', String(challenge.id)] })
      queryClient.invalidateQueries({ queryKey: ['challenge-custom', String(challenge.id)] })
    },
    onError: error => {
      toastError(error?.response?.data?.error ?? 'Failed to join the challenge. Please try again.')
    },
  })

  const handleJoinChallenge = () => {
    if (challenge.follows || joinMutation.isPending) {
      return
    }
    joinMutation.mutate()
  }

  const { modalComp: submitModalComp, openModal: openSubmitModal } = useSubmitChallengeModal(challenge)

  // N.B. it's not enough to specify timeZone to date-fns-tz's format function, as it also
  //      depends on the locale
  //      See https://stackoverflow.com/questions/65416339/how-to-detect-timezone-abbreviation-using-date-fns-tz
  const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone

  const challengeAction = () => {
    if (challengePreRegistration) {
      return (
        <CallToActionButton onClick={onClickPreRegistrationButton}>Sign Up for Pre-Registration</CallToActionButton>
      )
    }

    if (timeStatus === 'ended') {
      return null
    }

    return (
      <div>
        {hasJoined && <div data-testid="challenge-joined-message">You have joined this challenge</div>}
        {userCanJoin && !hasJoined && (
          <div>
            <Button
              data-variant="primary"
              disabled={!userCanJoin || joinMutation.isPending}
              onClick={handleJoinChallenge}
              data-testid="challenge-join-button"
            >
              {joinMutation.isPending ? 'Joining…' : 'Join This Challenge'}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <NavigationBar user={user}>
      <StyledChallengeDetailsBanner data-testid="challenge-details-banner">
        <LeftColumn>
          <div>
            <Link to={{ pathname: '/challenges' }} className="backToChallenges">
              <ArrowLeftIcon /> Back to All Challenges
            </Link>
            <ChallengeName>{challenge.name}</ChallengeName>
            <ChallengeDescription>{challenge.description}</ChallengeDescription>
          </div>
          <ChallengeStateLabel $timeStatus={timeStatus}>{stateLabel}</ChallengeStateLabel>
          <ChallengeDateArea>
            <StartEnd>
              <ChallengeDateLabel>Starts</ChallengeDateLabel>
              <ChallengeDate $timeStatus={timeStatus}>
                {format(new TZDate(challenge.startAt, userTimeZone), 'MM/dd/yyyy HH:mm:ss z', { locale: enUS })}
              </ChallengeDate>

              <ChallengeDateLabel>Ends</ChallengeDateLabel>
              <ChallengeDate $timeStatus={timeStatus}>
                {format(new TZDate(challenge.endAt, userTimeZone), 'MM/dd/yyyy HH:mm:ss z', { locale: enUS })}
              </ChallengeDate>
            </StartEnd>
            <ChallengeDateRemaining>
              {getChallengeTimeRemaining({
                startAt: challenge.startAt,
                endAt: challenge.endAt,
              })}
            </ChallengeDateRemaining>
          </ChallengeDateArea>
        </LeftColumn>
        <RightColumn>
          <ChallengeThumbnail src={challenge.cardImageUrl} alt={`${challenge.name} thumbnail`} />
        </RightColumn>
      </StyledChallengeDetailsBanner>
      <PageContainer className="px-2 py-0 sm:px-4 md:px-8 flex justify-between items-end flex-wrap">
        <div className="flex flex-col mb-4">
          {challengeAction()}
          {userCanSubmitEntry && (
            <>
              {submitModalComp}
              <Button
                data-variant="primary"
                style={{ marginTop: '12px' }}
                onClick={openSubmitModal}
                data-testid="challenge-submit-entry-button"
              >
                Submit Challenge Entry
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-4 mb-4">
          {user?.can_create_challenges && (
            <>
              {challenge?.meta ? (
                <OutlineButton className={styles.outlineButton} as="a" href={`/challenges/${challenge.id}/editor`}>
                  <PencilIcon /> Challenge Content
                </OutlineButton>
              ) : (
                <OutlineButton className={styles.outlineButton} as={Link} to={`/challenges/${challenge.id}/content`}>
                  <PencilIcon /> Challenge Content
                </OutlineButton>
              )}
              <OutlineButton
                className={styles.outlineButton}
                as={Link}
                to={`/challenges/${challenge.id}/settings`}
                data-testid="challenge-settings-button"
              >
                <CogsIcon /> Settings
              </OutlineButton>
              <OutlineButton className={styles.outlineButton} as={Link} to={`/spaces/${challenge.spaceId}`}>
                <ObjectGroupIcon /> Challenge Space
              </OutlineButton>
            </>
          )}
        </div>
      </PageContainer>
    </NavigationBar>
  )
}
