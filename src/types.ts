export type Command =
  | 'remove'
  | 'store'
  | 'recover'
  | 'password'

export type LockData = Record<string, string>

export type PromptOption<TValue, TLabel extends string = string> = {
  value: TValue
  label: TLabel
  hint?: string
}
