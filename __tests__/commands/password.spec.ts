import { makeSut } from '@/tests/mocks/make-sut'
import { InvalidParamError } from '@/utils/errors'
import p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => '20'),
  outro: jest.fn()
}))

describe('password', () => {
  const sut = makeSut('password')

  it('should generate a password with prompt length', async () => {
    await sut.exec()

    expect((p.outro as jest.Mock).mock.calls[0][0]).toHaveLength(20)
  })

  it('should generate a password with params length', async () => {
    await sut.exec('15')

    expect((p.outro as jest.Mock).mock.calls[0][0]).toHaveLength(15)
  })

  it('should verify password length', async () => {
    expect.assertions(3)
    const edges = ['7', '101', 'NaN']

    for (const edge of edges) {
      const promise = sut.exec(edge)
      expect(promise).rejects.toThrowError(InvalidParamError)
    }
  })
})
