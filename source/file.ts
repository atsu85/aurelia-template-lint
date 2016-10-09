import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { FileKind } from './file-kind';
export { FileKind } from './file-kind';

export class File {
  public content: string;
  public kind: FileKind;
  public path?: string;
  public issues = new Array<Issue>();
  public imports?: string[];

  constructor(opts: { content: string, kind: FileKind, path?: string, issues?: Array<Issue>, imports?: string[] }) {
    if (opts.path && opts.path.trim() == "")
      throw Error("path cannot be empty string");
    
    // FIXME @MeirionHughes - are issues and imports really required or not? Based on callers of this constructor I'd say they shouldn't be required, but based on following checks it looks like they are required
    if (opts.issues === null)
      throw Error("issues cannot be null");
    if (opts.imports === null)
      throw Error("issues cannot be null");

    Object.assign(this, opts);
  }
}
