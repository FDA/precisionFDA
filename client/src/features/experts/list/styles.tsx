import styled from 'styled-components'


export const StyledExpertListItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 600px) {
    flex-direction: row;
    gap: 32px;
  }
`

export const ItemImage = styled.div`
  img {
    min-width: 96px;
    height: 96px;
    border-radius: 10%;
  }
`

export const ExpertRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  width: fit-content;
`

export const Name = styled.div`
  font-weight: bold;
  color: var(--c-text-700);
`

export const Info = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: var(--c-text-500);
`

export const ExpertButtonRowWrap = styled.div`
  display: flex;
  justify-content: space-between;
`
export const ExpertButtonRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  width: fit-content;
  margin-top: 16px;
  white-space: nowrap;
  flex-wrap: wrap;
`
