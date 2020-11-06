import { tsquery } from '@phenomnomnominal/tsquery';
import { CallExpression, Node } from 'typescript';
import { findFunctionCallExpressions, findPropertyCallExpressions, getNamedImportAlias, getStringsFromExpression } from '../utils/ast-helpers';
import { TranslationCollection } from '../utils/translation.collection';
import { ParserInterface } from './parser.interface';

const ROUTER_MODULE_NAME = '@angular/router';
const ROUTER_IMPORT_NAME = 'RouterModule';

export class UIMessageParser implements ParserInterface {
	public extract(source: string, filePath: string): TranslationCollection | null {
		const sourceFile = tsquery.ast(source, filePath);

		const componentImport = getNamedImportAlias(sourceFile, '@stewie/framework', 'BaseComponent');
		const injectionImport = getNamedImportAlias(sourceFile, '@stewie/framework', 'BaseInjection');
		if (componentImport || injectionImport) {
			console.log('FOUND UI MESSAGES');

			let collection: TranslationCollection = new TranslationCollection();

			const callExpressions = this.getCollections(sourceFile);
			console.log(callExpressions.length);
			callExpressions.forEach((callExpression) => {
				const [firstArg] = callExpression.arguments;
				if (!firstArg) {
					return;
				}
				const strings = getStringsFromExpression(firstArg);
				collection = collection.addKeys(strings.map(s => `uimessages.${s}.summary`));
				collection = collection.addKeys(strings.map(s => `uimessages.${s}.detail`));
			});
			return collection;
		}
		return null;
	}

	private getCollections(sourceFile: Node): CallExpression[] {
		return [
			...findPropertyCallExpressions(sourceFile, 'uiSuccess', 'uiSuccess'),
			...findPropertyCallExpressions(sourceFile, 'uiWarn', 'uiWarn'),
			...findPropertyCallExpressions(sourceFile, 'uiError', 'uiError'),
			...findPropertyCallExpressions(sourceFile, 'uiInfo', 'uiInfo'),
			...findPropertyCallExpressions(sourceFile, 'uiCustom', 'uiCustom')
		];
	}
}
