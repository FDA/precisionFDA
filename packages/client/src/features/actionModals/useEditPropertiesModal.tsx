import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { get } from 'lodash'
import { XIcon } from 'lucide-react'
import type React from 'react'
import { useMemo } from 'react'
import { type FieldErrors, useFieldArray, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import '../../utils/yupValidators'
import type { ServerScope } from '../home/types'
import { useModal } from '../modal/useModal'
import type { RequestResponse } from './useFeatureMutation'

type Properties = {
  [key: string]: string
}

type FormInputs = {
  props: {
    key: string
    value: string
  }[]
}

const schema = Yup.object().shape({
  props: Yup.array()
    // @ts-expect-error custom validator for unique keys
    .unique('key', 'Name must be unique')
    .of(
      Yup.object().shape({
        key: Yup.string().required('Name is required'),
        value: Yup.string().nullable(),
      }),
    )
    .default([{ key: '', value: '' }]),
})

async function editPropertiesRequest({ targetId, properties }: { targetId: string; properties: Properties }) {
  return axios
    .post<RequestResponse>('/api/v2/properties', {
      targetId,
      properties,
    })
    .then(d => d.data)
}

const mergeAndUpdateProperties = (
  itemProperties: Properties,
  newPropertiesObject: Properties,
  commonPropertiesKeys: string[],
): Properties => {
  const mergedProperties = { ...itemProperties, ...newPropertiesObject }
  commonPropertiesKeys.forEach(key => {
    if (!Object.hasOwn(newPropertiesObject, key) && commonPropertiesKeys.includes(key)) {
      delete mergedProperties[key]
    }
  })
  return mergedProperties
}

function getError(errors: FieldErrors<FormInputs>, key: string) {
  let message = ''
  let isError = false
  const e = get(errors, key)
  if (e) {
    message = e['message']
    isError = true
  }
  return { message, isError }
}

const EditPropertiesForm = ({
  selected,
  setShowModal,
  onSuccess,
}: {
  selected: {
    id: number | string
    uid: string
    name: string
    properties: Properties
  }[]
  setShowModal: (show: boolean) => void
  onSuccess?: (res: unknown) => void
}) => {
  const commonProperties: Properties = selected.reduce<Properties>((acc, obj, idx) => {
    if (idx === 0) return { ...obj.properties }
    // For subsequent objects, retain only those properties that are common and have the same value
    Object.keys(acc).forEach(key => {
      if (acc[key] !== obj.properties[key]) {
        delete acc[key]
      }
    })
    return acc
  }, {})

  const propertiesArr = Object.entries(selected.length == 1 ? selected[0].properties : commonProperties).map(
    ([key, value]) => ({
      key,
      value,
    }),
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      props: propertiesArr.length ? propertiesArr : [],
    },
  })

  const { fields, append, remove } = useFieldArray<FormInputs>({
    name: 'props',
    control,
  })

  const mutation = useMutation({
    mutationKey: ['edit-resource-properties'],
    mutationFn: (payload: { targetId: string; properties: Properties }) =>
      editPropertiesRequest({
        targetId: payload.targetId,
        properties: payload.properties,
      }),
  })

  const onSubmit = async (d: FormInputs) => {
    const newProperties = d.props.reduce((acc, { key, value }) => {
      if (key.length) acc[key] = value.trimEnd() // Only add properties with a non-empty key
      return acc
    }, {} as Properties)

    for (const item of selected) {
      const propertiesToUse =
        selected.length === 1
          ? newProperties
          : mergeAndUpdateProperties(item.properties, newProperties, Object.keys(commonProperties))

      await mutation.mutateAsync({
        targetId: item.uid ?? `folder-${item.id}`,
        properties: propertiesToUse,
      })
    }

    if (onSuccess) onSuccess(mutation.data)
    if (setShowModal) setShowModal(false)
    toastSuccess('Properties updated')
  }

  const handleAppendProperty = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    append({ key: '', value: '' })
  }

  return (
    <>
      <form
        className="flex min-h-0 flex-col"
        id="edit-properties-form"
        onSubmit={e => {
          e.stopPropagation()
          handleSubmit(onSubmit)(e)
        }}
      >
        <div className="max-h-(--modal-max-height,50vh) overflow-y-auto px-2 py-4 sm:px-4">
          <div className="flex flex-col gap-4">
            {fields.length === 0 && (
              <div className="flex items-center gap-4 text-sm">
                No properties have been added{' '}
                <Button className="h-auto p-0" type="button" variant="link" onClick={handleAppendProperty}>
                  Add a property
                </Button>
              </div>
            )}
            {fields.map((field, index) => {
              const { isError, message } = getError(errors, `props.${index}.key`)
              return (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-4"
                  key={field.id}
                  data-testid={`property-${index}`}
                >
                  <div className="min-w-0">
                    <label className="sr-only" htmlFor={`property-${field.id}-key`}>
                      Property name
                    </label>
                    <Input
                      id={`property-${field.id}-key`}
                      aria-invalid={isError || undefined}
                      aria-describedby={isError ? `property-${field.id}-error` : undefined}
                      autoComplete="off"
                      {...register(`props.${index}.key`)}
                      disabled={mutation.isPending}
                    />
                    {isError && (
                      <p id={`property-${field.id}-error`} className="mt-1 text-destructive text-xs">
                        {message}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="sr-only" htmlFor={`property-${field.id}-value`}>
                      Property value
                    </label>
                    <Input
                      id={`property-${field.id}-value`}
                      autoComplete="off"
                      {...register(`props.${index}.value`)}
                      disabled={mutation.isPending}
                    />
                  </div>
                  <Button
                    aria-label="Remove property"
                    data-testid="property-remove"
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={mutation.isPending}
                  >
                    <XIcon />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </form>
      <DialogFooter className="sm:justify-between">
        {fields.length > 0 ? (
          <Button className="h-auto self-center p-0" type="button" variant="link" onClick={handleAppendProperty}>
            Add another property
          </Button>
        ) : (
          <div />
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-properties-form"
            disabled={mutation.isPending || Object.keys(errors).length > 0}
          >
            Edit Properties
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

export function useEditPropertiesModal<
  T extends {
    id: number | string
    uid: string
    name: string
    properties: Properties
    scope: ServerScope
    featured: boolean
  },
>({ selected, onSuccess }: { selected: T[]; onSuccess?: (res: unknown) => void }) {
  const { isShown, setShowModal } = useModal()
  const mSelected = useMemo(() => selected, [isShown])

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="edit-properties-modal"
        data-testid="modal-edit-properties"
        variant="medium"
        className="min-w-0 gap-0 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>
            {`Edit ${mSelected.length > 1 ? `common properties for ${mSelected.length} items` : `properties for ${mSelected[0]?.name}`}`}
          </DialogTitle>
        </DialogHeader>
        <EditPropertiesForm onSuccess={onSuccess} setShowModal={setShowModal} selected={mSelected} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
