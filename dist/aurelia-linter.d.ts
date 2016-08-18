import { Linter, Issue } from 'template-lint';
import { Reflection } from './reflection';
import { Config } from './config';
export declare class AureliaLinter {
    linter: Linter;
    reflection: Reflection;
    config: Config;
    private init;
    constructor(config?: Config);
    lint(html: string, path?: string): Promise<Issue[]>;
}
