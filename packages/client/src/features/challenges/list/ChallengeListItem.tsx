import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Link } from 'react-router'
import styled from 'styled-components'
import { canonicalTimeZoneId } from '@/utils/timezones'
import { Content, ItemBody } from '../../../components/Public/public-layout.styles'
import { useAuthUser } from '../../auth/useAuthUser'
import { DateArea, ItemImage, ViewDetailsButton } from '../challenges.styles'
import type { Challenge } from '../types'
import { getChallengeTimeRemaining, getTimeStatus } from '../util'

const StyledChallengeListItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 600px) {
    flex-direction: row;
    gap: 32px;
  }
`

export const Title = styled(Link)`
  color: var(--c-text-700);
  font-size: 20px;
  font-weight: bold;
  line-height: 20px;
`

export const ChallengeListItem = ({ challenge }: { challenge: Challenge }) => {
  const user = useAuthUser()
  const preferredTimeZone = canonicalTimeZoneId(user?.time_zone) || new Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <StyledChallengeListItem>
      <ItemImage $timeStatus={getTimeStatus(challenge.startAt, challenge.endAt)}>
        <img width="100%" src={challenge.cardImageUrl} alt="sf" />
      </ItemImage>
      <ItemBody>
        <Title to={`/challenges/${challenge.id}`} data-testid="challenge-title">
          {challenge.name}
        </Title>
        <DateArea>
          <span className="challenge-date-label">Starts</span>
          <span className="challenge-date">
            {format(new TZDate(challenge.startAt, preferredTimeZone), 'MM/dd/yyyy', { locale: enUS })}
          </span>
          <span>&rarr;</span>
          <span className="challenge-date-label">Ends</span>
          <span className="challenge-date">
            {format(new TZDate(challenge.endAt, preferredTimeZone), 'MM/dd/yyyy', { locale: enUS })}{' '}
          </span>
          <div className="challenge-date-remaining">
            {getChallengeTimeRemaining({
              startAt: challenge.startAt,
              endAt: challenge.endAt,
            })}
          </div>
        </DateArea>
        <Content>{challenge.description}</Content>
        <div>
          <ViewDetailsButton as={Link} to={`/challenges/${challenge.id}`} data-turbolinks="false">
            View Details &rarr;
          </ViewDetailsButton>
        </div>
      </ItemBody>
    </StyledChallengeListItem>
  )
}
