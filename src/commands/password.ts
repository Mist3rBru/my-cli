import { errorHandler, getParams, hasParams } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

const specials = '!@#$%^&*()_+{}:"<>?|[];\',./`~'
const lowercase = 'abcdefghijklmnopqrstuvwxyz'
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const numbers = '0123456789'
const all = specials + lowercase + uppercase + numbers

export async function passwordCommand(): Promise<void> {
  let passwordLength: number

  if (hasParams()) {
    const params = getParams()
    const length = Number(params[0])

    const error = verifyPasswordLength(length)
    if (error) return errorHandler(error)

    passwordLength = length
  } else {
    passwordLength = await passwordPrompt()
  }

  let password = ''
  while (password.length < passwordLength) {
    password += pick(specials, 1)
    password += pick(lowercase, 1)
    password += pick(uppercase, 1)
    password += pick(all, 3, 10)
  }

  p.outro(shuffle(password.substring(0, passwordLength)))
}

async function passwordPrompt(): Promise<number> {
  const response = await p.text({
    message: 'What is your desired password length?',
    validate: res => {
      const error = verifyPasswordLength(Number(res))
      if (error) return error.message
    }
  })
  verifyPromptResponse(response)
  return Number(response)
}

function verifyPasswordLength(length: number): Error | null {
  if (isNaN(length) || length < 8) {
    return new InvalidParamError('passwordLength', 'min length is 8')
  } else if (length > 100) {
    return new InvalidParamError('passwordLength', 'max length is 100')
  }
  return null
}

function pick(str: string, min: number, max?: number): string {
  let chars: string = ''
  let n: number = max ? min + Math.floor(Math.random() * (max - min + 1)) : min

  for (let i = 0; i < n; i++) {
    chars += str.charAt(Math.floor(Math.random() * str.length))
  }

  return chars
}

function shuffle(str: string): string {
  const array: string[] = str.split('')
  let tmp: string
  let current: number
  let top: number = array.length

  if (top) {
    while (--top) {
      current = Math.floor(Math.random() * (top + 1))
      tmp = array[current]
      array[current] = array[top]
      array[top] = tmp
    }
  }

  return array.join('')
}
