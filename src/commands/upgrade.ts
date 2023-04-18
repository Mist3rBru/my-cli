import { exec, execAsync } from '@/utils/cmd'
import * as p from '@clack/prompts'

type Outdated = {
  '@mist3rbru/my-cli': {
    current: string
    wanted: string
    latest: string
    dependent: string
    location: string
  }
}

export async function outdatedCommand(): Promise<void> {
  const version = await getVersion()
  if (version && version.current !== version.latest) {
    p.note(
      `🚀 Use \`my upgrade\` to update from v${version.current} to v${version.latest}`
    )
  } else {
    p.outro('🔥 Your are up to date')
  }
}

export async function upgradeCommand(): Promise<void> {
  const version = await getVersion()
  if (version && version.current !== version.latest) {
    exec('npm install -g @mist3rbru/my-cli@latest')
    p.note(`🚀 Upgraded from v${version.current} to v${version.latest}`)
  } else {
    p.outro('🔥 Your are up to date')
  }
}

async function getVersion() {
  const res = await execAsync('npm outdated @mist3rbru/my-cli --global --json')
  const json = JSON.parse(res) as Outdated | null
  const version = json?.['@mist3rbru/my-cli']
  return version
}