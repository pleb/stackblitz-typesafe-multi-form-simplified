import type { Validator } from 'remix-validated-form'
import type { UnionToIntersection } from 'type-fest'

type MapKeys<T> = T extends any
  ? {
      [key in keyof Required<T>]-?: key
    }
  : never

type FormFields<T> = UnionToIntersection<MapKeys<T>>

function createObjectFieldsProxy<T extends object>(): FormFields<T> {
  return new Proxy(
    {},
    {
      get(target: T, property: string | symbol): any {
        return property
      },
    },
  ) as FormFields<T>
}

type ValidatorModelType<T extends Validator<any>> = T extends Validator<
  infer TModel
>
  ? TModel
  : never

export const useValidatorFields = <T extends Validator<any>>(_validator: T) =>
  createObjectFieldsProxy<ValidatorModelType<T>>()

export const useFields = <T extends object>(_object: T) =>
  createObjectFieldsProxy<T>()
