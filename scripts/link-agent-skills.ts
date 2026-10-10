import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Single source of truth for skills. Each tool root is symlinked to this WHOLE
// directory — not per-skill — so anything added under agents/skills is instantly
// visible everywhere, and there is no way to leave an untracked orphan behind.
const SKILLS_SOURCE_DIR = path.resolve('agents/skills')
const LINK_ROOTS = ['.claude/skills', '.codex/skills'] as const

export async function main(): Promise<void> {
  for (const linkRoot of LINK_ROOTS) {
    await linkSkillsDir(path.resolve(linkRoot))
  }

  console.log(`Linked agents/skills into ${LINK_ROOTS.length} tool roots.`)
}

async function linkSkillsDir(linkPath: string): Promise<void> {
  await fs.mkdir(path.dirname(linkPath), { recursive: true })

  const stats = await tryLstat(linkPath)
  if (stats) {
    if (stats.isSymbolicLink()) {
      const currentTarget = path.resolve(path.dirname(linkPath), await fs.readlink(linkPath))
      if (currentTarget === SKILLS_SOURCE_DIR) {
        return
      }
      await fs.rm(linkPath)
    } else if (stats.isDirectory()) {
      if (await tryLstat(path.join(linkPath, MIRROR_MARKER))) {
        await fs.rm(linkPath, { recursive: true, force: true })
      } else {
        await removeRegenerableLinkFarm(linkPath)
      }
    } else {
      await fs.rm(linkPath)
    }
  }

  const target =
    process.platform === 'win32'
      ? SKILLS_SOURCE_DIR
      : path.relative(path.dirname(linkPath), SKILLS_SOURCE_DIR)
  const linkType = process.platform === 'win32' ? 'junction' : 'dir'
  try {
    await fs.symlink(target, linkPath, linkType)
  } catch (error) {
    if (!isLinkUnsupported(error)) {
      throw error
    }
    await mirrorSkillsDir(linkPath)
  }
}

// Fork change (exFAT drives such as D: cannot hold junctions or symlinks): a real copy,
// refreshed by every run of this script. Re-run it after editing agents/skills.
const MIRROR_MARKER = '.mirror-of-agents-skills'

function isLinkUnsupported(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException).code
  return code === 'EISDIR' || code === 'EPERM' || code === 'ENOTSUP' || code === 'EINVAL'
}

async function mirrorSkillsDir(linkPath: string): Promise<void> {
  await fs.cp(SKILLS_SOURCE_DIR, linkPath, { recursive: true })
  await fs.writeFile(path.join(linkPath, MIRROR_MARKER), 'copy of agents/skills; regenerate with: node scripts/link-agent-skills.ts\n')
  console.warn(`Links unsupported here; mirrored agents/skills into ${path.relative(process.cwd(), linkPath)}.`)
}

/**
 * Replaces a legacy real directory (the old per-skill link farm) with the
 * whole-folder symlink — but only if every entry is itself a symlink, i.e. it
 * holds no real content. If a real file/dir is found, refuse: a human must move
 * it into agents/skills first, so no authored skill is ever destroyed.
 */
async function removeRegenerableLinkFarm(dirPath: string): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isSymbolicLink()) {
      throw new Error(
        `${path.relative(process.cwd(), path.join(dirPath, entry.name))} is a real file/dir, ` +
          `not a symlink — move it into agents/skills, then re-run.`,
      )
    }
  }
  await fs.rm(dirPath, { recursive: true, force: true })
}

async function tryLstat(filePath: string): Promise<Awaited<ReturnType<typeof fs.lstat>> | null> {
  try {
    return await fs.lstat(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }

    throw error
  }
}

const entryFilePath = process.argv[1]

if (entryFilePath && import.meta.url === pathToFileURL(entryFilePath).href) {
  main().catch((error: unknown) => {
    console.error('Failed to link agent skills.')
    console.error(error)
    process.exitCode = 1
  })
}
