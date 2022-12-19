import { useQuery } from '@tanstack/react-query'
import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../components/Button'
import { InfoCircleIcon } from '../../components/icons/InfoCircleIcon'
import { Svg } from '../../components/icons/Svg'
import { Loader } from '../../components/Loader'
import { theme } from '../../styles/theme'
import { generateKeyRequest } from './api'
import { Modal } from '../modal'
import { useModal } from '../modal/useModal'


const StyledBody = styled.div`
  padding: 12px;
`
const StyledButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
`
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`

const ExpirationInfo = styled.div`
  display: flex;
  align-items: center;

  ${Svg} {
    margin-right: 8px;
  }
`

const StyledInput = styled.textarea`
  margin: 0 0 16px 0;
  padding: 8px;
  flex: 1 0 auto;
  font-family: ${theme.monofontFamily};
  width: 450px;
  height: 150px;
  resize: none;
  box-sizing: border-box;
  font-size: 12.5px;
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

const GenerateKey = ({
  handleClose,
}: {
  handleClose: () => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['generate-key'],
    queryFn: generateKeyRequest,
    staleTime: 60000,
  })
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const copyToClipboard = () => {
    const val = inputRef.current?.value
    if(val) {
      toast.success('The key has been copied into your clipboard.')
      navigator.clipboard.writeText(val)
    }
  }

  return (
    <StyledBody>
      {isLoading ? <KeyLoader><Loader /></KeyLoader> : <StyledInput ref={inputRef} disabled value={data?.Key} />}
      <InfoRow><ExpirationInfo><InfoCircleIcon height={15} />This key will expire in 24 hours</ExpirationInfo><Link target="_blank" to="/docs/cli">CLI Documentation</Link></InfoRow>
      <StyledButtonRow>
        <ButtonSolidBlue onClick={copyToClipboard}>Copy to Clipboard</ButtonSolidBlue>
        <ButtonSolidBlue onClick={handleClose}>Close</ButtonSolidBlue>
      </StyledButtonRow>
    </StyledBody>
  )
}

export const useGenerateKeyModal = () => {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <Modal
      id="generate-key"
      data-testid="generate-key"
      headerText="CLI Authentication Key"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <GenerateKey handleClose={handleClose} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
