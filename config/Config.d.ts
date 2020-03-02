/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    logFilePath: string
    level: string
  }
  export const config: Config
  export type Config = IConfig
}
