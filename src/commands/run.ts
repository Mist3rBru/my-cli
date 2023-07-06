import { App } from '@/main/app'
import { exec, hasFlag } from '@/utils/cmd'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { PackageJson, getPackageJson } from '@/utils/file-system'
import { objectKeys } from '@/utils/mappers'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import p from '@clack/prompts'

async function runCommand(scripts: string[], flags: string[]): Promise<void> {
  const hasScripts = scripts.length
  const isDeep = hasFlag(['--deep', '-d'], flags)

  if (hasScripts && isDeep) {
    deepRun(scripts)
  } else if (hasScripts) {
    shallowRun(scripts)
  } else {
    await runPrompt()
  }
}

function run(scripts: string[]): void {
  for (const script of scripts) {
    exec(`npm run ${script}`, { log: false })
  }
}

function shallowRun(scripts: string[]): void {
  const packageJson = getPackageJson()
  if (!packageJson?.scripts) {
    throw new NotFoundError('packageJson.scripts')
  }
  for (const script of scripts) {
    if (!packageJson.scripts[script]) {
      throw new NotFoundError(script)
    }
  }
  run(scripts)
}

function deepRun(scripts: string[]): void {
  const localFolders = readdirSync(cwd, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
  for (const folder of localFolders) {
    const packageJson = getPackageJson(join(cwd, folder, 'package.json'))
    if (packageJson?.scripts) {
      process.chdir(join(cwd, folder))
      run(verifyScripts(scripts, packageJson))
    }
  }
}

async function runPrompt(): Promise<void> {
  const packageJson = getPackageJson()
  if (!packageJson?.scripts) {
    throw new NotFoundError('packageJson.scripts')
  }

  const scripts = await p.multiselect<PromptOption<string>[], string>({
    message: 'Select some scripts to run in sequence: ',
    options: objectKeys(packageJson.scripts).map(script => ({
      label: script,
      value: script
    })),
    required: true
  })
  verifyPromptResponse(scripts)

  run(scripts)
}

function verifyScripts(scripts: string[], packageJson: PackageJson): string[] {
  const result: string[] = []
  for (const script of scripts) {
    if (packageJson?.scripts?.[script]) {
      result.push(script)
    }
  }
  return result
}

export function runRecord(app: App): void {
  app.register({
    name: 'run',
    alias: null,
    params: ['<script>...'],
    flags: ['--deep', '-d'],
    description: "Run scripts from project's package.json in sequence",
    example: 'my run lint build test',
    action: runCommand
  })
}
