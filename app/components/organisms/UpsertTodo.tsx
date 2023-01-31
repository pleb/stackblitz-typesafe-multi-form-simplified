import { useEffect } from 'react'
import { ValidatedForm } from 'remix-validated-form'
import {
  ValidatedHiddenInput,
  ValidatedTextInput,
} from '~/components/atoms/ValidatedInput'
import { useFocus } from '~/hooks/useFocus'
import { Button } from '~/components/atoms/Button'
import { useValidatorFields } from '~/hooks/useFields'
import { useDispatchActions } from '~/hooks/useDispatchActions'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const upsertTodoValidationSchema = z.object({
  _action: z.literal('upsert'),
  description: z.string().min(2).max(50),
  id: z.number().optional(),
})

const upsertTodoValidator = withZod(upsertTodoValidationSchema)

export const UpsertTodo = <
  T extends {
    description: string
    id: number | string
  },
>({
  todo,
  onSubmit,
  disabled,
}: {
  todo?: T
  onSubmit: () => void
  disabled?: boolean
}) => {
  const fields = useValidatorFields(upsertTodoValidator)
  const dispatchActions = useDispatchActions(upsertTodoValidator)
  const [inputRef, setInputFocus] = useFocus<HTMLInputElement>()
  useEffect(() => {
    setInputFocus()
  }, [todo])

  return (
    <ValidatedForm
      validator={upsertTodoValidator}
      onSubmit={() => onSubmit?.()}
      resetAfterSubmit={true}
      method='post'
    >
      <ValidatedHiddenInput name={fields.id} value={todo?.id.toString()} />
      <div className='mt-2 py-3 px-4 grid grid-flow-col auto-cols-[1fr_200px] gap-2 items-start'>
        <ValidatedTextInput
          ref={inputRef}
          className='p-2 border'
          label='To-do description'
          placeholder='Todo description'
          name={fields.description}
          value={todo?.description}
          disabled={disabled}
        />
        <Button
          className='text-black'
          type='submit'
          name={fields._action}
          value={dispatchActions.upsert}
          disabled={disabled}
        >
          {todo ? 'Edit' : 'Add'}
        </Button>
      </div>
    </ValidatedForm>
  )
}
