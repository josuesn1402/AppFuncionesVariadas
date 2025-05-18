import { useState } from 'react'
import { Clipboard, Check, ChevronLeft } from 'lucide-react'
import { languages, type Language } from '../models/LanguageModel'
import type { PageProps } from '../models/props'
import { validateSyntaxWithBabel } from '../hooks/useValidateSyntaxWithBabel'

const cleanCode = (code: string, lang: Language) => {
	const withoutBlockComments = code.replace(/\/\*[\s\S]*?\*\//g, '')
	const withoutLineComments = withoutBlockComments
		.split(/\r?\n/)
		.map((line) => line.replace(/\/\/.*$/, '').trim())
		.filter((line) => line !== '')
		.map((line) => {
			if (['ts', 'tsx', 'js', 'jsx'].includes(lang)) {
				return line.startsWith('import') && !line.endsWith(';')
					? line + ';'
					: line
			}
			return line
		})

	if (lang === 'sql') {
		return withoutLineComments.join(' ')
	}
	if (lang === 'php') {
		return withoutLineComments
			.map((line) => (line.endsWith(';') ? line : line + ' '))
			.join('')
			.replace(/\s+/g, ' ')
			.trim()
	}
	return withoutLineComments.join(' ')
}

export default function LimpiarCodigo({ changeView }: PageProps) {
	const [language, setLanguage] = useState<Language>('tsx')
	const [input, setInput] = useState('')
	const [output, setOutput] = useState('')
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleConvert = () => {
		const syntaxError = validateSyntaxWithBabel(input, language)
		if (syntaxError) {
			setError(syntaxError)
			setOutput('')
			return
		}
		setError(null)
		const cleaned = cleanCode(input, language)
		setOutput(cleaned)
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(output)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	const handleClear = () => {
		setInput('')
		setOutput('')
		setError(null)
	}

	const handleLanguageChange = (lang: Language) => {
		setLanguage(lang)
		setOutput('')
		setError(null)
	}

	return (
		<div className="min-h-screen flex bg-[#1e1e1e] text-white font-sans">
			<aside className="w-52 bg-[#202123] text-white p-4 space-y-1.5 border-r border-gray-700">
				<button
					className="flex items-center gap-x-1.5 text-lg font-semibold mb-4 cursor-pointer w-full"
					onClick={changeView}
				>
					<ChevronLeft />
					<h2>Lenguaje</h2>
				</button>
				{languages.map((lang) => (
					<button
						key={lang}
						onClick={() => handleLanguageChange(lang)}
						className={`block w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${
							language === lang ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
						}`}
					>
						{lang.toUpperCase()}
					</button>
				))}
			</aside>
			<main className="flex-1 p-6 bg-[#343541]">
				<h1 className="text-2xl font-bold mb-4 cursor-pointer">
					Limpiar Código{' '}
					<span className="text-blue-400">({language.toUpperCase()})</span>
				</h1>
				<textarea
					rows={10}
					className="w-full p-3 rounded bg-[#40414f] text-white border border-gray-600 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					placeholder="Pega tu código aquí..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<div className="mb-4 flex flex-wrap gap-3 justify-between">
					<div className="flex gap-2">
						<button
							onClick={handleConvert}
							className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700"
						>
							Limpiar código
						</button>
						{output && (
							<button
								onClick={handleCopy}
								className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-600"
							>
								{copied ? (
									<>
										<Check size={16} /> Copiado
									</>
								) : (
									<>
										<Clipboard size={16} /> Copiar resultado
									</>
								)}
							</button>
						)}
					</div>
					<button
						onClick={handleClear}
						className="bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-800"
					>
						Limpiar campo
					</button>
				</div>
				{error && (
					<div className="mb-4 p-3 bg-red-700 text-white rounded">
						<strong>Error de sintaxis:</strong> {error}
					</div>
				)}
				{output && (
					<div className="mt-6 relative">
						<h2 className="font-semibold mb-2">Resultado:</h2>
						<div className="relative">
							<pre className="bg-[#202123] border border-gray-700 p-4 rounded-md text-sm overflow-x-auto text-white whitespace-pre-wrap">
								{output}
							</pre>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}
