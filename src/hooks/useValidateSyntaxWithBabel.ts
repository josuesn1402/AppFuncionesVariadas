import * as babelParser from '@babel/parser'
import type { ParserPlugin } from '@babel/parser'
import type { Language } from '../models/LanguageModel'
import type { ConvertToExcelModel } from '../models/ConvertToExcel'

export function validateSyntaxWithBabel(
	code: string,
	lang: Language
): string | null {
	try {
		const plugins: ParserPlugin[] = []

		if (lang === 'tsx') {
			plugins.push('typescript', 'jsx')
		} else if (lang === 'ts') {
			plugins.push('typescript')
		} else if (lang === 'jsx') {
			plugins.push('jsx')
		}

		babelParser.parse(code, {
			sourceType: 'module',
			plugins
		})

		return null
	} catch (err: unknown) {
		if (err instanceof Error) {
			return 'Error de sintaxis: ' + err.message
		}
		return 'Error desconocido de sintaxis'
	}
}

export function validateSyntax(code: string, lang: Language): string | null {
	if (['js', 'jsx', 'ts', 'tsx'].includes(lang)) {
		// Usar Babel para validar JS/TS/JSX/TSX
		return validateSyntaxWithBabel(code, lang)
	}

	if (lang === 'sql') {
		const sqlKeywords = [
			'SELECT',
			'INSERT',
			'UPDATE',
			'DELETE',
			'CREATE',
			'DROP'
		]
		if (!sqlKeywords.some((kw) => code.toUpperCase().includes(kw))) {
			return 'Error: código SQL inválido o muy simple.'
		}
		return null
	}

	if (lang === 'php') {
		if (!code.trim().startsWith('<?php') && !code.trim().startsWith('<?')) {
			return 'Error: El código PHP debe comenzar con <?php o <?'
		}
		if (!code.includes(';')) {
			return 'Error: Código PHP parece incompleto, falta ;'
		}
		return null
	}

	if (lang === 'json') {
		try {
			JSON.parse(code)
			return null
		} catch (e) {
			return (
				'Error de sintaxis JSON: ' +
				(e instanceof Error ? e.message : String(e))
			)
		}
	}

	if (lang === 'html' || lang === 'xml') {
		// Validación simple: que tenga etiquetas < y >
		if (!code.includes('<') || !code.includes('>')) {
			return `Error: código ${lang.toUpperCase()} inválido o muy simple.`
		}
		return null
	}

	if (lang === 'css') {
		// Validación básica: que tenga selectores o propiedades CSS
		if (!code.includes('{') || !code.includes('}')) {
			return 'Error: código CSS inválido o muy simple.'
		}
		return null
	}

	if (lang === 'bash') {
		// Validación simple: que empiece con shebang o comandos básicos
		if (
			!code.trim().startsWith('#!') &&
			!code.includes('echo') &&
			!code.includes('ls')
		) {
			return 'Error: código Bash inválido o muy simple.'
		}
		return null
	}

	if (lang === 'markdown') {
		// Validación básica: que contenga algunos elementos markdown comunes
		if (!code.includes('#') && !code.includes('- ') && !code.includes('*')) {
			return 'Error: código Markdown inválido o muy simple.'
		}
		return null
	}

	// Para otros lenguajes como python, java, c, ruby, rust,
	// puedes agregar validaciones básicas o dejar pasar por ahora

	return null
}

export function validateConvertToExcelSyntax(
	code: string,
	type: ConvertToExcelModel
): string | null {
	if (type === 'json') {
		try {
			JSON.parse(code)
			return null
		} catch (e) {
			return (
				'Error de sintaxis JSON: ' +
				(e instanceof Error ? e.message : String(e))
			)
		}
	}

	if (type === 'array.ts' || type === 'array.js') {
		try {
			const plugins: ParserPlugin[] = ['jsx']
			if (type === 'array.ts') plugins.push('typescript')
			babelParser.parse(code, { sourceType: 'module', plugins })
			return null
		} catch (err: unknown) {
			if (err instanceof Error) {
				return 'Error de sintaxis en array: ' + err.message
			}
			return 'Error desconocido en sintaxis de array'
		}
	}

	return 'Tipo no soportado para validación'
}
