/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    logFilePath: string
    level: string
    threshold: number
    numberOfMostVisitedSites: number
  }
  export const config: Config
  export type Config = IConfig
}
