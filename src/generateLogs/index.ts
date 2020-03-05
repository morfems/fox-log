import Generator from "./generator";
import { promises as fs } from 'fs';
import { config } from 'node-config-ts';
import { $log as logger } from "@tsed/logger";


logger.level = config.level;
logger.name = "LOG GENERATOR";

const generator = new Generator(config, fs, __dirname, logger);
generator.generateRandomLogLines();
