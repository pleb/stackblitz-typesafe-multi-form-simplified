import { DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from '~/utilities/database'
import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'
import { dispatch } from '~/utilities/dispatcher'
import { ValidatedForm } from 'remix-validated-form'
import { useCallback, useState } from 'react'
import { randomDelayBetween } from '~/utilities/delay'
import { GlassButton } from '~/components/molecules/GlassButton'
import { Title } from '~/components/atoms/Title'
import { GlassPanel } from '~/components/molecules/GlassPanel'
import {
  completeTodoItemValidationSchema,
  deleteTodoItemValidationSchema,
  TodoItem,
} from '~/components/organisms/TodoItem'
import { Panel } from '~/components/atoms/Panel'
import {
  UpsertTodo,
  upsertTodoValidationSchema,
} from '~/components/organisms/UpsertTodo'
import { useLoadingContext } from '~/contexts/loadingContext'
import Loading from 'icon/LoadingIndicator'
import { useValidatorFields } from '~/hooks/useFields'
import { useDispatchActions } from '~/hooks/useDispatchActions'

const validator = withZod(
  z.discriminatedUnion('_action', [
    z.object({
      _action: z.literal('reset'),
    }),
    upsertTodoValidationSchema,
    deleteTodoItemValidationSchema,
    completeTodoItemValidationSchema,
  ]),
)

export const loader = async () => {
  return db.load().filter(i => !i.completed && !i.deleted)
}

export const action = async (data: DataFunctionArgs) => {
  // Simulate network latency
  await randomDelayBetween(250, 1000)

  return await dispatch(data, validator, {
    reset: async _ => {
      db.populateSample()
    },
    delete: async result => {
      db.patch(result.id, { deleted: true })
    },
    complete: async result => {
      db.patch(result.id, { completed: true })
    },
    upsert: async result => {
      if (result.id) {
        db.patch(result.id, { description: result.description })
      } else {
        db.append({ description: result.description })
      }
    },
  })
}

type Todo = Awaited<ReturnType<typeof loader>>[number]

export default function Index() {
  const todos = useLoaderData<typeof loader>()
  const [edit, setEdit] = useState<Todo>()
  const clearEdit = useCallback(() => setEdit(undefined), [setEdit])
  const loadingContext = useLoadingContext()
  const fields = useValidatorFields(validator)
  const dispatchActions = useDispatchActions(validator)

  return (
    <div
      className={
        'sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg mx-[auto]'
      }
    >
      <ValidatedForm validator={validator} method='post' className='grid mb-2'>
        <GlassButton
          type='submit'
          name={fields._action}
          value={dispatchActions.reset}
          className='place-self-end py-1 px-4'
          onClick={clearEdit}
          disabled={loadingContext.isLoading}
        >
          Reset
        </GlassButton>
      </ValidatedForm>
      <GlassPanel className='relative'>
        <Title aria-label='Simple to-do'>Simple Todo</Title>
        <Loading
          className='absolute right-2 top-5 animate-spin h-5 w-5 mr-3'
          hidden={!loadingContext.isLoading}
        />
        <Panel className='mt-2 px-4' aria-live='polite'>
          {todos.map((td, i) => (
            <TodoItem
              key={`todo-${td.id}`}
              todo={td}
              onEdit={setEdit}
              disableActions={Boolean(edit)}
              disabled={loadingContext.isLoading}
            />
          ))}
        </Panel>
        <UpsertTodo
          todo={edit}
          onSubmit={() => {
            setTimeout(clearEdit)
          }}
          disabled={loadingContext.isLoading}
        />
      </GlassPanel>
    </div>
  )
}
