import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PanelConstructor } from '@uiw/react-codemirror'
import type { AxiosError } from 'axios'
import { Maximize2, RotateCcw } from 'lucide-react'
import type React from 'react'
import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  type Control,
  Controller,
  type FieldErrors,
  type Resolver,
  type UseFormRegister,
  type UseFormSetValue,
  useForm,
} from 'react-hook-form'
import { Tooltip } from 'react-tooltip'
import * as Yup from 'yup'
import { Button, IconButton } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import CodeMirrorEditor from '../../components/CodeMirrorEditor/CodeMirrorEditor'
import { FieldGroup } from '../../components/form/FieldGroup'
import { CheckboxLabel, InputError } from '../../components/form/form.styles'
import { InputText } from '../../components/InputText'
import { Loader } from '../../components/Loader'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/modal.styles'
import { useModal } from '../modal/useModal'
import { workstationSnapshotRequest } from './executions.api'
import type { IExecution } from './executions.types'

interface CreateSnapshotForm {
  name: string
  terminate: boolean
  preScript?: string
}

const HintText = ({ children }: PropsWithChildren) => <div className="text-sm text-(--c-text-700)">{children}</div>

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name required')
    .matches(/^[a-zA-Z0-9-_ ]+$/, 'Name can only contain alphanumeric, dash, underscore and spaces'),
  terminate: Yup.boolean().required('Terminate required'),
  preScript: Yup.string().optional(),
})

const padZero = (n: number): string => {
  const prefix = n < 10 ? '0' : ''
  return `${prefix}${n}`
}

const getDefaultSnapshotName = (execution?: IExecution): string => {
  const now = new Date()
  const dateString = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}-${padZero(now.getHours())}${padZero(now.getMinutes())}`
  return `${execution?.name} ${dateString}`
}

const PRESCRIPT_MIN_VERSION = '1.3.0'

const supportsPreScript = (apiVersion?: string | null): boolean => {
  if (!apiVersion) return false
  const [major, minor, patch] = apiVersion.split('.').map(Number)
  const [minMajor, minMinor, minPatch] = PRESCRIPT_MIN_VERSION.split('.').map(Number)
  if (major !== minMajor) return major > minMajor
  if (minor !== minMinor) return minor > minMinor
  return patch >= minPatch
}

const SnapshotForm = ({
  register,
  control,
  handleSubmit,
  errors,
  isSubmitting,
  setValue,
  onSubmit,
  showPreScript,
  appTitle,
}: {
  register: UseFormRegister<CreateSnapshotForm>
  control: Control<CreateSnapshotForm>
  handleSubmit: ReturnType<typeof useForm<CreateSnapshotForm>>['handleSubmit']
  errors: FieldErrors<CreateSnapshotForm>
  isSubmitting: boolean
  setValue: UseFormSetValue<CreateSnapshotForm>
  onSubmit: (data: CreateSnapshotForm) => void
  showPreScript: boolean
  appTitle: string | null
}) => {
  const [isEditorModalShown, setIsEditorModalShown] = useState(false)
  // stable reference so CodeMirror doesn't tear down and remount the toolbar panel on every render
  const createEditorToolbar: PanelConstructor = useCallback(() => {
    const dom = document.createElement('div')
    dom.className = 'cm-editor-toolbar'
    const root = createRoot(dom)

    root.render(
      <>
        <IconButton
          type="button"
          className="!h-6 !w-6 !min-w-6 !rounded"
          aria-label="Reset editor"
          data-tooltip-id="snapshot-editor-toolbar-tooltip"
          data-tooltip-content="Reset editor"
          onClick={() => setValue('preScript', '')}
        >
          <RotateCcw size={14} />
        </IconButton>
        <IconButton
          type="button"
          className="!h-6 !w-6 !min-w-6 !rounded"
          aria-label="Expand editor"
          data-tooltip-id="snapshot-editor-toolbar-tooltip"
          data-tooltip-content="Expand editor"
          onClick={() => setIsEditorModalShown(true)}
        >
          <Maximize2 size={14} />
        </IconButton>
        <Tooltip id="snapshot-editor-toolbar-tooltip" place="bottom" className="!px-1.5 !py-0.5 !text-[11px]" />
      </>,
    )

    return {
      dom,
      top: true,
      destroy: () => root.unmount(),
    }
  }, [setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="create-snapshot-form" className="flex flex-col gap-4 p-6">
      <FieldGroup label="Name" required>
        <InputText {...register('name')} aria-label="Name" disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>

      {showPreScript && (
        <FieldGroup label="Pre-execution script">
          <Controller
            name="preScript"
            control={control}
            render={({ field }) => (
              <CodeMirrorEditor
                height="280px"
                width="600px"
                defaultLanguage="shell"
                value={field.value ?? ''}
                onChange={value => field.onChange(value)}
                topPanel={createEditorToolbar}
              />
            )}
          />
          {appTitle && <HintText>This script runs before the snapshot is created.</HintText>}
        </FieldGroup>
      )}

      <ModalNext
        id="modal-expand-snapshot-pre-script"
        data-testid="modal-expand-snapshot-pre-script"
        isShown={isEditorModalShown}
        hide={() => setIsEditorModalShown(false)}
        variant="medium"
      >
        <ModalHeaderTop headerText="Pre-execution script" hide={() => setIsEditorModalShown(false)} />
        <div className="flex flex-1 min-h-0 overflow-hidden p-6 [&>div]:min-h-0 [&>div]:flex-1">
          <Controller
            name="preScript"
            control={control}
            render={({ field }) => (
              <CodeMirrorEditor
                height="calc(90vh - 200px)"
                width="100%"
                defaultLanguage="shell"
                value={field.value ?? ''}
                onChange={value => field.onChange(value)}
              />
            )}
          />
        </div>
        <Footer>
          <ButtonRow>
            <Button data-variant="outline" onClick={() => setValue('preScript', '')}>
              Reset
            </Button>
            <Button onClick={() => setIsEditorModalShown(false)}>Done</Button>
          </ButtonRow>
        </Footer>
      </ModalNext>

      <FieldGroup>
        <CheckboxLabel>
          <Checkbox
            {...register('terminate')}
            disabled={isSubmitting}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue('terminate', event.target.checked)}
          />
          Terminate
        </CheckboxLabel>
        <HintText>When enabled the workstation will terminate after creating the snapshot</HintText>
      </FieldGroup>
    </form>
  )
}

export function useSnapshotModal({ selected }: { selected: IExecution }) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()

  useEffect(() => {
    if (isShown) {
      setValue('name', getDefaultSnapshotName(selected))
    }
  }, [isShown])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateSnapshotForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema) as unknown as Resolver<CreateSnapshotForm>,
    defaultValues: {
      name: getDefaultSnapshotName(selected),
      terminate: false,
      preScript: '',
    },
  })

  const mutation = useMutation({
    mutationKey: ['snapshot-job'],
    mutationFn: (vals: CreateSnapshotForm) => workstationSnapshotRequest(selected.uid, vals),
    onError: (e: AxiosError) => {
      const payload = e.response?.data as { error?: { message: string } }
      const message = payload?.error?.message ?? e.message
      toastError(`Error creating snapshot: ${message}`)
    },
    onSuccess: (res: { meta?: { messages: { message: string }[] } }) => {
      if (res?.meta?.messages[0]) {
        toastError(`Error creating snapshot: ${res?.meta?.messages[0].message}`)
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
      })
      queryClient.invalidateQueries({
        queryKey: ['execution', selected.uid],
      })
      setShowModal(false)
      const isSpaceScope = selected.scope.startsWith('space')
      const scopeString = isSpaceScope ? 'the Space' : 'My Home'
      toastSuccess(`Creating snapshot - the snapshot file will appear in ${scopeString} shortly after its completion`)
    },
  })

  const handleFormSubmit = (vals: CreateSnapshotForm) => {
    const preScript = vals.preScript?.startsWith('#!/usr/bin/env bash')
      ? vals.preScript.replace(/^#!\/usr\/bin\/env bash\r?\n?/, '')
      : vals.preScript
    mutation.mutate({ ...vals, preScript })
  }

  const modalComp = (
    <ModalNext
      id="modal-create-snapshot"
      data-testid="modal-create-snapshot"
      data-variant="large"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText="Create Snapshot" hide={() => setShowModal(false)} />
      <ModalScroll style={{ maxHeight: 'var(--modal-max-height, 65vh)' }}>
        <SnapshotForm
          register={register}
          control={control}
          handleSubmit={handleSubmit}
          errors={errors}
          isSubmitting={isSubmitting}
          setValue={setValue}
          onSubmit={handleFormSubmit}
          showPreScript={supportsPreScript(selected?.workstationApiVersion)}
          appTitle={selected?.appTitle ?? null}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="primary" type="submit" form="create-snapshot-form" disabled={mutation.isPending}>
            Create Snapshot
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
