import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { uploadAppConfigFileRequest } from './apps.api'
import { FileType } from './apps.types'
import MonacoEditor from '../../components/MonacoEditor/MonacoEditor'
import { Button } from '../../components/Button'

const StyledFileUpload = styled.div`
  padding-bottom: 0;
`

const StyledLoader = styled(Loader)`
  padding: 0;
`
const StyledUploadModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const filetypeName = {
  cwl: 'CWL',
  wdl: 'WDL',
} satisfies Record<FileType, string>

const CustomHeaderTop = ({ filetype, fileName, handleFileChange }: { filetype: FileType, fileName?: string, handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <StyledUploadModalHeader>
      <span>Import {filetypeName[filetype]} file</span>
      <label>
        <input
          style={{ display: 'none' }}
          type="file"
          accept={`.${filetype}`}
          onChange={handleFileChange}
        />
        <Button as="div">{fileName || 'Select File'}</Button>
      </label>
    </StyledUploadModalHeader>
  )
}

const FileUpload = ({
  setShowModal,
  filetype,
}: {
  setShowModal: (show: boolean) => void
  filetype: FileType
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [text, setText] = useState<string>()
  const [fileName, setFileName] = useState<string>()

  const mutation = useMutation({
    mutationKey: ['import-app-from-file'],
    mutationFn: ({ file, format }: { file?: string; format: FileType }) => {
      const form = new FormData()
      form.append('format', format)
      form.append('file', file || '')
      return uploadAppConfigFileRequest(form)
    },
    onSuccess: res => {
      if (res.id) {
        setShowModal(false)
        queryClient.invalidateQueries({
          queryKey: ['apps'],
        })
        navigate(`/home/apps/${res.id}`)
        toast.success(
          `Created app by importing ${filetypeName[filetype]} file`,
        )
      }
    },
  })

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0]

    if (!file) return

    setText(await file.text())
    setFileName(file.name)
  }

  const handleImportAndCreate = () => {
    mutation.mutate({ file: text, format: filetype })
  }

  return (
    <>
      <ModalHeaderTop
        disableClose={false}
        headerText={
          <CustomHeaderTop
            filetype={filetype}
            fileName={fileName}
            handleFileChange={handleFileChange}
          />
        }
        hide={() => setShowModal(false)}
      />
      <StyledFileUpload>
        <MonacoEditor
          options={{
            minimap: {
              enabled: false,
            },
            padding: { top: 16 },
          }}
          defaultLanguage="cwl"
          height="40vh"
          width="50vw"
          onChange={v => setText(v)}
          value={text}
        />
        <Footer>
          {mutation.isPending && <StyledLoader />}
          <Button type="button" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            data-variant="primary"
            disabled={text === undefined || mutation.isPending}
            type="button"
            onClick={handleImportAndCreate}
          >
            Create App
          </Button>
        </Footer>
      </StyledFileUpload>
    </>
  )
}

export function useUploadAppConfigFile({
  filetype,
}: {
  filetype: FileType
}) {
  const { isShown, setShowModal } = useModal()
  const id = `modal-${filetype}-import`

  const modalComp = (
    <ModalNext
      id={id}
      data-testid={id}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <FileUpload filetype={filetype} setShowModal={setShowModal} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
