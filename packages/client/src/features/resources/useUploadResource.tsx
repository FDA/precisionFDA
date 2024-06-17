import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { InputText } from '../../components/InputText'
import { processFile } from './uploadImage'
import {
  useCreateResourceMutation,
} from './useCreateResourceMutation'
import { getExt, isImageFromExt } from './util'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileThumb } from './styles'
import { FileWithPreview } from './resources.types'
import { Button } from '../../components/Button'

// Convert file to base64
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

export const useUploadResource = ({
  id,
  onSuccess,
}: {
  id: string
  onSuccess: () => void
}) => {
  const createResourceMutation = useCreateResourceMutation(id)
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const processFileWithStatusUpdate = async (
    s: FileWithPreview,
    index: number,
  ) => {
    const name = s.customName === '' ? s.originalName : s.customName
    const { fileUid, id: resourceId } =
      await createResourceMutation.mutateAsync({ name })
    const newFiles = [...selectedFiles]

    newFiles[index].uploadStatus = 'uploading'
    setSelectedFiles(newFiles)

    await processFile(s.file, fileUid)

    newFiles[index].uploadStatus = 'uploaded'
    setSelectedFiles(newFiles)
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      const fileWithPreviewArray: FileWithPreview[] = []
      for (let i = 0; i < files.length; i++) {
        const { name } = files[i]
        // eslint-disable-next-line no-await-in-loop
        const preview = await toBase64(files[i])
        fileWithPreviewArray.push({
          rid: crypto.randomUUID(),
          file: files[i],
          preview,
          originalName: name,
          customName: name,
          uploadStatus: 'pending',
        })
      }

      setSelectedFiles(fileWithPreviewArray)
    }
  }

  const handleNameChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newFiles = [...selectedFiles]
    newFiles[index].customName = event.target.value
    setSelectedFiles(newFiles)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    const promises = selectedFiles.map((selected, index) =>
      processFileWithStatusUpdate(selected, index),
    )
    return Promise.all(promises)
      .then(() => {
        setIsLoading(false)
        setSelectedFiles([])
        if (onSuccess) onSuccess()
        toast.success('All files have been processed')
      })
      .catch(error => {
        toast.error(`Error processing files: ${error}`)
      })
  }

  const removeItemByIndex = (rid: string) => {
    const nsel = selectedFiles.filter(s => s.rid !== rid)
    setSelectedFiles(nsel)
  }

  useEffect(() => {
    return () => {
      setSelectedFiles([])
    }
  }, [])

  return {
    isLoading,
    selectedFiles,
    removeItemByIndex,
    handleSubmit,
    handleNameChange,
    handleFileChange,
  }
}

const FileRow = styled.div`
  display: flex;
  gap: 8px;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`
const Status = styled.div``
const Image = styled.img``
const CustomNameInput = styled(InputText)``

export const Item = ({
  disabled = false,
  file,
  index,
  removeItemByIndex,
  handleNameChange,
}: {
  file: FileWithPreview,
  disabled: boolean
  index: string | number
  removeItemByIndex: any
  handleNameChange: any
}) => {
  return (
    <FileRow key={file.rid}>
      {isImageFromExt(getExt(file.originalName)) ? <Image src={file.preview} alt="resource item" width="100" /> : <FileThumb><FileIcon height={80} /><div className="ext">{getExt(file.originalName)}</div></FileThumb>}
      <Info>
        <Status>
          <b>Upload Status:</b> {file.uploadStatus}
        </Status>

        <CustomNameInput
          disabled={disabled}
          type="text"
          value={file.customName}
          onChange={event => handleNameChange(event, index)}
        />
        {!disabled && (
          <Button type="button" onClick={() => removeItemByIndex(file.rid)}>
            Remove
          </Button>
        )}
      </Info>
    </FileRow>
  )
}
