import { useQuery } from '@tanstack/react-query'
import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { InfoCircleIcon } from '../../components/icons/InfoCircleIcon'
import { Svg } from '../../components/icons/Svg'
import { Loader } from '../../components/Loader'
import { theme } from '../../styles/theme'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { generateKeyRequest } from './api'
import { Button } from '../../components/Button'

const StyledButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 24px;
`
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 24px;
  padding-bottom: 0;
`

const ExpirationInfo = styled.div`
  display: flex;
  align-items: center;

  ${Svg} {
    margin-right: 8px;
  }
`

const StyledTextarea = styled.textarea`
  margin: 0;
  padding: 8px;
  flex: 1 0 auto;
  font-family: ${theme.monofontFamily};
  width: 450px;
  height: 150px;
  resize: none;
  box-sizing: border-box;
  font-size: 12.5px;
`
const ContentWrapper = styled.div`
  padding: 12px 24px;
  padding-bottom: 0;
`

const KeyLoader = styled.div`
  cursor: default;
  box-sizing: border-box;
  background-color: rgba(239, 239, 239, 0.3);
  color: rgb(84, 84, 84);
  border-color: rgba(118, 118, 118, 0.3);
  border-width: 1px;
  border-style: solid;
  width: 450px;
  height: 150px;
  margin: 0 0 16px 0;
  padding: 8px;
`

const GenerateKey = ({ handleClose }: { handleClose: () => void }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['generate-key'],
    queryFn: generateKeyRequest,
    staleTime: 60000,
  })

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const copyToClipboard = () => {
    const val = inputRef.current?.value
    if (val) {
      toast.success('The key has been copied into your clipboard')
      navigator.clipboard.writeText(val)
    }
  }

  return (
    <>
      <ModalScroll>
        <ContentWrapper>
          {isLoading ? (
            <KeyLoader>
              <Loader />
            </KeyLoader>
          ) : (
            <StyledTextarea ref={inputRef} disabled value={data?.Key} />
          )}
        </ContentWrapper>
      </ModalScroll>
      <InfoRow>
        <ExpirationInfo>
          <InfoCircleIcon height={15} />
          This key will expire in 24 hours
        </ExpirationInfo>
        <Link target="_blank" to="/docs/cli">
          CLI Documentation
        </Link>
      </InfoRow>
      <StyledButtonRow>
        <Button data-variant="primary" onClick={copyToClipboard}>
          Copy to Clipboard
        </Button>
        <Button data-variant="primary" onClick={handleClose}>Close</Button>
      </StyledButtonRow>
    </>
  )
}

export const useGenerateKeyModal = () => {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <ModalNext
      id="generate-key"
      data-testid="generate-key"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText="CLI Authentication Key"
        hide={() => setShowModal(false)}
      />
      <GenerateKey handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
