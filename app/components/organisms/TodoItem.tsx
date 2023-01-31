import { ValidatedForm } from 'remix-validated-form'
import { Panel } from '~/components/atoms/Panel'
import {
  ValidatedCheckboxInput,
  ValidatedHiddenInput,
} from '~/components/atoms/ValidatedInput'
import { IconButton } from '~/components/molecules/IconButton'
import Delete from 'icon/Delete'
import Edit from 'icon/Edit'
import { cn } from '~/utilities/cn'
import { useValidatorFields } from '~/hooks/useFields'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { useDispatchActions } from '~/hooks/useDispatchActions'

export const deleteTodoItemValidationSchema = z.object({
  _action: z.literal('delete'),
  id: z.number(),
})
export const completeTodoItemValidationSchema = z.object({
  _action: z.literal('complete'),
  id: z.number(),
})

const todoItemValidator = withZod(
  z.discriminatedUnion('_action', [
    deleteTodoItemValidationSchema,
    completeTodoItemValidationSchema,
  ]),
)

export const TodoItem = <
  T extends {
    description: string
    id: number | string
  },
>({
  todo,
  onEdit,
  disableActions,
  disabled,
}: {
  todo: T
  onEdit: (todo: T) => void
  disableActions: boolean
  disabled?: boolean
}) => {
  const fields = useValidatorFields(todoItemValidator)
  const actions = useDispatchActions(todoItemValidator)

  return (
    <ValidatedForm validator={todoItemValidator} method='post'>
      <ValidatedHiddenInput name={fields.id} value={todo.id.toString()} />
      <Panel
        border='b'
        className={cn('p-3', 'hover:bg-glass/20', 'grid grid-flow-col')}
      >
        <div
          aria-label={`To-do entry ${todo.description}`}
          aria-flowto={`delete-${todo.id}`}
        >
          {todo.description}
        </div>
        {!disableActions && (
          <div className='w-30 justify-self-end grid gap-2 grid-flow-col content-center'>
            <IconButton
              id={`delete-${todo.id}`}
              color='Red'
              type='submit'
              name={fields._action}
              value={actions.delete}
              disabled={disabled}
              aria-label='Delete to-do entry'
            >
              <Delete aria-hidden={true} />
            </IconButton>
            <IconButton
              color='Green'
              onClick={() => onEdit(todo)}
              disabled={disabled}
              aria-label='Edit to-do entry'
            >
              <Edit aria-hidden={true} />
            </IconButton>
            <ValidatedCheckboxInput
              className='ml-2'
              name={fields._action}
              label='Complete to-do entry'
              value={actions.complete}
              submitOnChange={true}
              disabled={disabled}
            />
          </div>
        )}
      </Panel>
    </ValidatedForm>
  )
}
