import { Validator } from 'remix-validated-form'
import { DispatchActionsLookup } from '~/utilities/dispatcher'
import { useFields } from '~/hooks/useFields'

export function useDispatchActions<T extends Validator<any>>(
  _validator: T,
): DispatchActionsLookup<T> {
  return useFields<DispatchActionsLookup<T>>(_validator)
}
