import { Loader2Icon } from 'lucide-react'
import { type Control, Controller, type FieldErrors } from 'react-hook-form'
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
import type { RunJobFormType, SelectType } from '../apps.types'
import { ErrorMessageForField } from './ErrorMessageForField'

/**
 * Component for selecting context if applicable.
 *
 * @param control
 * @param isSubmitting
 * @param selectableContexts
 * @param errors
 * @constructor
 */
export const SelectContext = ({
  control,
  isSubmitting,
  selectableContexts,
  errors,
}: {
  control: Control<RunJobFormType, unknown, unknown>
  isSubmitting: boolean
  selectableContexts: SelectType[] | undefined
  errors: FieldErrors<RunJobFormType>
}) => {
  return (
    <FieldGroup label="Context" required>
      <Controller
        data-testid="select-context"
        name="scope"
        control={control}
        render={({ field }) => {
          const contexts = selectableContexts ?? []
          const isContextsLoading = selectableContexts === undefined
          const current = field.value as SelectType | undefined

          return (
            <Combobox<SelectType>
              id="select_context"
              name={String(field.name)}
              required
              items={contexts}
              value={current ?? null}
              onValueChange={next => {
                if (next != null) {
                  field.onChange(next)
                }
                field.onBlur()
              }}
              isItemEqualToValue={(a, b) => a.value === b.value}
              disabled={isSubmitting || isContextsLoading}
              inputRef={field.ref}
            >
              <ComboboxInput
                placeholder={isContextsLoading ? '' : 'Choose…'}
                className={cn(
                  'relative max-w-full',
                  isContextsLoading && '[&_input]:caret-transparent [&_input]:text-transparent',
                )}
                disabled={isSubmitting || isContextsLoading}
                aria-busy={isContextsLoading}
                onBlur={field.onBlur}
              >
                {isContextsLoading ? (
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 z-10 flex items-center">
                    <Loader2Icon aria-hidden className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                  </span>
                ) : null}
              </ComboboxInput>
              <ComboboxContent side="bottom" align="start">
                <ComboboxEmpty>No contexts match.</ComboboxEmpty>
                <ComboboxList>
                  {(item: SelectType) => (
                    <ComboboxItem key={item.value} value={item} disabled={item.isDisabled}>
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
