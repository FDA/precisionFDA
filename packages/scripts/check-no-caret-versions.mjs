import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT_DIR = resolve('.')
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.idea', '.turbo', '.pnpm-store', 'vendor'])

function collectPackageJsonPaths(dir) {
  const packageJsonPaths = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue
      }
      packageJsonPaths.push(...collectPackageJsonPaths(join(dir, entry.name)))
      continue
    }

    if (entry.name === 'package.json') {
      packageJsonPaths.push(relative(ROOT_DIR, join(dir, entry.name)))
    }
  }

  return packageJsonPaths
}

const packageJsonPaths = collectPackageJsonPaths(ROOT_DIR).sort((a, b) => a.localeCompare(b))

const dependencyKeys = new Set([
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
  'resolutions',
])

function hasCaretVersion(version) {
  return typeof version === 'string' && version.includes('^')
}

function checkDependencyBlock(packagePath, blockName, block) {
  const violations = []
  if (block == null || typeof block !== 'object' || Array.isArray(block)) {
    return violations
  }

  for (const [depName, depVersion] of Object.entries(block)) {
    if (hasCaretVersion(depVersion)) {
      violations.push(`${packagePath} -> ${blockName}.${depName}: ${depVersion}`)
    }
  }

  return violations
}

function getViolationsForPackage(packagePath, json) {
  const violations = []

  for (const key of dependencyKeys) {
    violations.push(...checkDependencyBlock(packagePath, key, json[key]))
  }

  if (json.pnpm && typeof json.pnpm === 'object') {
    violations.push(...checkDependencyBlock(packagePath, 'pnpm.overrides', json.pnpm.overrides))
  }

  return violations
}

const violations = []
for (const packagePath of packageJsonPaths) {
  const fullPath = resolve(packagePath)

  try {
    const content = readFileSync(fullPath, 'utf8')
    const json = JSON.parse(content)
    violations.push(...getViolationsForPackage(packagePath, json))
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Failed to read or parse package.json at ${packagePath}: ${message}`)
    process.exit(1)
  }
}

if (violations.length > 0) {
  console.error('Caret versions are not allowed in package.json dependency fields:')
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('No caret versions found in package.json dependency fields.')

