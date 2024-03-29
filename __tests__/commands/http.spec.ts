import { makeSut } from '@/tests/mocks/make-sut.js'
import { InvalidParamError, MissingParamError } from '@/utils/errors.js'
import axios from 'axios'
import color from 'picocolors'
import { log } from '@clack/prompts'

jest.mock('axios', () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const mockFn = () => ({ data: '' })

  class Axios {
    create = (): this => this
    get = jest.fn(mockFn)
    post = jest.fn(mockFn)
    put = jest.fn(mockFn)
    delete = jest.fn(mockFn)
  }

  return new Axios()
})

jest.spyOn(process, 'exit').mockImplementation()

jest.mock('@clack/prompts', () => ({
  log: {
    message: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
  outro: jest.fn(),
}))

describe('http', () => {
  const sut = makeSut('http')
  const statusLabel = color.cyan('"StatusCode"')
  const bodyLabel = color.cyan('"Body"')

  it('should throw on missing params', async () => {
    const promise = sut.exec()

    await expect(promise).rejects.toThrow(MissingParamError)
  })

  it('should complete host and port', async () => {
    await sut.exec('/test')

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/test', {
      headers: {},
    })
  })

  it('should complete host', async () => {
    await sut.exec(':3030/test')

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3030/test', {
      headers: {},
    })
  })

  it('should not complete', async () => {
    await sut.exec('http://localhost:3000/test')

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/test', {
      headers: {},
    })
  })

  it('should throw on invalid url', async () => {
    const promise = sut.exec('foo')

    await expect(promise).rejects.toThrow(InvalidParamError)
  })

  it('should parse nested body', async () => {
    await sut.exec(
      'post /test key1=1 key2.subset1=true key2.subset2=false key3=Hello+World key4.subset1.subset2=3.14',
    )

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/test',
      {
        key1: 1,
        key2: {
          subset1: true,
          subset2: false,
        },
        key3: 'Hello World',
        key4: {
          subset1: {
            subset2: 3.14,
          },
        },
      },
      {
        headers: {},
      },
    )
  })

  it('should parse headers', async () => {
    await sut.exec('post /test h.foo=bar h.bar=baz')

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/test',
      {},
      {
        headers: { foo: 'bar', bar: 'baz' },
      },
    )
  })

  it('should log http success response', async () => {
    const result = {
      status: 200,
      data: {
        user: {
          id: 1,
          name: 'John',
        },
      },
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce(result)

    sut.enableLogs()
    await sut.exec('get', '/test')

    expect(log.error).toHaveBeenCalledTimes(0)
    expect(log.success).toHaveBeenCalledWith(`${statusLabel}: 200`)
    expect(log.message).toHaveBeenCalledWith(`${bodyLabel}: {`)
  })

  it('should log http error response', async () => {
    const result = {
      status: 400,
      data: undefined,
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce(result)

    sut.enableLogs()
    await sut.exec('get', '/test')

    expect(log.success).toHaveBeenCalledTimes(0)
    expect(log.error).toHaveBeenCalledWith(`${statusLabel}: 400`)
    expect(log.message).toHaveBeenCalledWith(`${bodyLabel}: No Content`)
  })

  it('should log http error response with error message', async () => {
    const result = {
      status: 500,
      data: 'ServerError',
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce(result)

    sut.enableLogs()
    await sut.exec('get', '/test')

    expect(log.success).toHaveBeenCalledTimes(0)
    expect(log.error).toHaveBeenCalledWith(`${statusLabel}: 500`)
    expect(log.message).toHaveBeenCalledWith(`${bodyLabel}: "ServerError"`)
  })

  it('should call put method', async () => {
    await sut.exec('put /test')

    expect(axios.put).toHaveBeenCalledTimes(1)
  })

  it('should call delete method', async () => {
    await sut.exec('delete /test')

    expect(axios.delete).toHaveBeenCalledTimes(1)
  })
})
