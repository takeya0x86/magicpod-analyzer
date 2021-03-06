import * as fs from 'node:fs/promises'
import * as yaml from 'js-yaml'

interface RawConfig {
  magicpod: {
    projects: string[]
    exporter: ExporterConfig
    lastRunStore: LastRunStoreConfig
  }
}

export interface MagicPodConfig {
  projects: MagicPodProject[]
  exporter: ExporterConfig
  lastRunStore: LastRunStoreConfig
}

export interface MagicPodProject {
  organization: string
  name: string
  fullName: string
}

export interface ExporterConfig {
  local?: LocalExporterConfig
  bigquery?: BigqueryExporterConfig
}

export interface LocalExporterConfig {
  outDir?: string
  format?: 'json' | 'json_lines'
}

export interface BigqueryExporterConfig {
  project?: string
  dataset?: string
  reports?: {
    name: 'test_report'
    table: string
  }[]
  maxBadRecords?: number
}

export interface LastRunStoreConfig {
  backend: 'local' | 'gcs'
}

export interface LocalLastRunStoreConfig extends LastRunStoreConfig {
  backend: 'local'
  path: string
}

export interface GCSLastRunStoreConfig extends LastRunStoreConfig {
  backend: 'gcs'
  project: string
  bucket: string
  path?: string
}

export async function loadConfig(configPath: string): Promise<MagicPodConfig> {
  const config = yaml.load(await fs.readFile(configPath, 'utf8')) as RawConfig
  const projects = config.magicpod.projects.map(project => {
    const [organization, name] = project.split('/')
    return {
      organization: organization,
      name: name,
      fullName: project,
    }
  })
  return {
    projects: projects,
    exporter: config.magicpod.exporter,
    lastRunStore: config.magicpod.lastRunStore,
  }
}
