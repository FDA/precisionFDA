import { Loader2Icon } from 'lucide-react'
import { type Control, Controller, type FieldErrors, type Path } from 'react-hook-form'
import { FieldGroup } from '@/components/form/FieldGroup'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { cn } from '@/utils/cn'
import type { SelectableSpace, SelectType } from '../apps.types'
import { ErrorMessageForField } from './ErrorMessageForField'

/**
 * Component for selecting space scope if applicable.
 *
 * @param control
 * @param isSubmitting
 * @param selectableSpaces
 * @param errors
 * @constructor
 */
export function SelectSpaceScope<T extends { scope: SelectType }>({
  control,
  isSubmitting,
  selectableSpaces,
  errors,
}: {
  control: Control<T, unknown, unknown>
  isSubmitting: boolean
  selectableSpaces: SelectableSpace[] | undefined
  errors: FieldErrors<T>
}) {
  return (
    <FieldGroup label="Space scope" required>
      <Controller
        name={'scope' as Path<T>}
        control={control}
        render={({ field }) => {
          const spaces = selectableSpaces ?? []
          const isSpacesLoading = selectableSpaces === undefined
          const current = field.value as SelectType | undefined

          return (
            <Combobox<SelectType>
              id="select_space_scope"
              name={String(field.name)}
              required
              items={spaces}
              value={current ?? null}
              onValueChange={next => {
                if (next != null) {
                  field.onChange(next)
                }
                field.onBlur()
              }}
              isItemEqualToValue={(a, b) => a.value === b.value}
              disabled={isSubmitting || isSpacesLoading}
              inputRef={field.ref}
            >
              <ComboboxInput
                placeholder={isSpacesLoading ? '' : 'Choose…'}
                className={cn(
                  'relative max-w-full',
                  isSpacesLoading && '[&_input]:caret-transparent [&_input]:text-transparent',
                )}
                disabled={isSubmitting || isSpacesLoading}
                aria-busy={isSpacesLoading}
                onBlur={field.onBlur}
              >
                {isSpacesLoading ? (
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 z-10 flex items-center">
                    <Loader2Icon aria-hidden className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                  </span>
                ) : null}
              </ComboboxInput>
              <ComboboxContent side="bottom" align="start">
                <ComboboxEmpty>No spaces match.</ComboboxEmpty>
                <ComboboxList>
                  {(item: SelectType) => (
                    <ComboboxItem key={item.value} value={item} disabled={item.isDisabled ?? false}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )
        }}
      />
      <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="scope" />
    </FieldGroup>
  )
}
