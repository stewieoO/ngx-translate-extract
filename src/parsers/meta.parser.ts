import { tsquery } from '@phenomnomnominal/tsquery';
import {
  Identifier,
  StringLiteral
} from 'typescript';
import { getNamedImportAlias } from '../utils/ast-helpers';
import { TranslationCollection } from '../utils/translation.collection';
import { ParserInterface } from './parser.interface';

const ROUTER_MODULE_NAME = '@angular/router';
const ROUTER_IMPORT_NAME = 'RouterModule';

export class MetaParser implements ParserInterface {
  public extract(source: string, filePath: string): TranslationCollection | null {
    const sourceFile = tsquery.ast(source, filePath);

    const markerImportName = getNamedImportAlias(sourceFile, ROUTER_MODULE_NAME, ROUTER_IMPORT_NAME);
    if (!markerImportName) {
      return null;
    }

    let collection: TranslationCollection = new TranslationCollection();
    const query = 'PropertyAssignment > Identifier[name=meta]';
    const nodes = tsquery<Identifier>(sourceFile, query);
    nodes.forEach(n => {
      const keys = tsquery<StringLiteral>(n.parent, 'StringLiteral').map(k => k.text);
      collection = collection.addKeys(keys);
    });
    return collection;
  }
}