export function mockParams(...params: string[]): void {
  process.argv = ['node', 'index.[tj]s', 'command', ...params, '--silent']
}

export function clearParams(): void {
  process.argv = ['--silent']
}
