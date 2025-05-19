import { useState } from 'react'
import { Clipboard, Check, ChevronLeft, Download } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import type { PageProps } from '../models/props'
import {
	convertToExcelModel,
	type ConvertToExcelModel
} from '../models/ConvertToExcel'
import { validateConvertToExcelSyntax } from '../hooks/useValidateSyntaxWithBabel'

type Format = 'xlsx' | 'xls' | 'csv'

const parseInput = (input: string, type: ConvertToExcelModel): any[] => {
	try {
		const parsed = eval(`(${input})`)
		if (type === 'json') {
			if (Array.isArray(parsed)) return parsed
			return [parsed]
		} else if (type === 'array.ts' || type === 'array.js') {
			return parsed
		}
		return []
	} catch {
		return []
	}
}

const exportToExcel = (
	data: any[],
	format: Format,
	fileName = 'archivo',
	sheetName = 'Hoja1',
	fontName = 'Calibri',
	fontSize = 11
) => {
	let finalData = data

	if (format !== 'csv') {
		// Para xlsx/xls hacemos la conversión a números y fechas
		finalData = data.map((row) => {
			const newRow: Record<string, any> = {}
			Object.entries(row).forEach(([key, value]) => {
				if (typeof value === 'string') {
					const trimmed = value.trim()
					const num = Number(trimmed)
					if (!isNaN(num) && trimmed !== '') {
						newRow[key] = num
						return
					}
					const tieneHora = /T\d{2}:\d{2}|\s\d{2}:\d{2}/.test(trimmed)
					const parsedDate = new Date(
						tieneHora ? trimmed : trimmed + 'T00:00:00'
					)
					if (!isNaN(parsedDate.getTime())) {
						parsedDate.setSeconds(parsedDate.getSeconds() + 36)
						newRow[key] = parsedDate
						return
					}
					newRow[key] = value
				} else {
					newRow[key] = value
				}
			})
			return newRow
		})
	}

	if (format === 'csv') {
		// Para csv exportamos la data en bruto sin convertir
		const csvContent = XLSX.utils.sheet_to_csv(
			XLSX.utils.json_to_sheet(finalData)
		)
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		saveAs(blob, `${fileName}.csv`)
		return
	}

	// Para xlsx y xls:
	const ws = XLSX.utils.json_to_sheet(finalData)

	if (format === 'xlsx') {
		const range = XLSX.utils.decode_range(ws['!ref'] || '')
		for (let R = range.s.r; R <= range.e.r; ++R) {
			for (let C = range.s.c; C <= range.e.c; ++C) {
				const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
				const cell = ws[cellAddress]
				if (cell && typeof cell === 'object') {
					cell.s = { font: { name: fontName, sz: fontSize } }
					if (typeof cell.v === 'string') {
						if (/\d{2}:\d{2}/.test(cell.v)) {
							cell.z = 'dd/mm/yyyy hh:mm:ss'
						} else if (/\d{2}\/\d{2}\/\d{4}/.test(cell.v)) {
							cell.z = 'dd/mm/yyyy'
						}
					}
				}
			}
		}
	}

	const wb = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(wb, ws, sheetName)

	const extension = format === 'xls' ? 'xls' : 'xlsx'
	const bookType = format === 'xls' ? 'biff8' : 'xlsx'

	const excelBuffer = XLSX.write(wb, {
		bookType,
		type: 'array',
		cellDates: true,
		cellStyles: format === 'xlsx'
	})

	const mimeType =
		format === 'xls'
			? 'application/vnd.ms-excel'
			: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

	const blob = new Blob([excelBuffer], { type: mimeType })
	saveAs(blob, `${fileName}.${extension}`)
}

export default function ConvertToExcel({ changeView }: PageProps) {
	const [convertToExcelModelData, setConvertToExcelModelData] =
		useState<ConvertToExcelModel>('json')
	const [input, setInput] = useState('')
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [fileName, setFileName] = useState('archivo')
	const [sheetName, setSheetName] = useState('Hoja1')
	const [fontName, setFontName] = useState('Calibri')
	const [fontSize, setFontSize] = useState(11)

	const handleExport = (format: Format) => {
		setError(null)
		const syntaxError = validateConvertToExcelSyntax(
			input,
			convertToExcelModelData
		)
		if (syntaxError) {
			setError(syntaxError)
			return
		}
		try {
			const data = parseInput(input, convertToExcelModelData)
			if (!Array.isArray(data))
				throw new Error('La entrada no es un array válido.')
			exportToExcel(data, format, fileName, sheetName, fontName, fontSize)
		} catch (err: any) {
			setError(err.message || 'Error al exportar')
		}
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(input)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	const handleClear = () => {
		setInput('')
		setError(null)
	}

	const handleConvertToExcelModelChange = (type: ConvertToExcelModel) => {
		setConvertToExcelModelData(type)
		setError(null)
	}

	const handleDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
		event.preventDefault()
		setError(null)

		const files = event.dataTransfer.files
		if (files.length === 0) return

		const file = files[0]
		const validTypes = ['application/json', 'text/plain']

		if (!validTypes.includes(file.type) && !file.name.match(/\.(json|txt)$/i)) {
			setError('Solo se permiten archivos JSON o TXT.')
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			const text = reader.result as string
			try {
				// Validamos que sea JSON válido
				JSON.parse(text)
				setInput(text)
			} catch {
				setError('El archivo no contiene un JSON válido.')
			}
		}
		reader.onerror = () => {
			setError('Error al leer el archivo.')
		}
		reader.readAsText(file)
	}

	const handleDragOver = (event: React.DragEvent<HTMLTextAreaElement>) => {
		event.preventDefault()
	}

	return (
		<div className="min-h-screen flex bg-[#1e1e1e] text-white font-sans">
			<aside className="w-52 bg-[#202123] text-white p-4 space-y-1.5 border-r border-gray-700">
				<button
					className="flex items-center gap-x-1.5 text-lg font-semibold mb-4 cursor-pointer w-full"
					onClick={changeView}
				>
					<ChevronLeft />
					<h2>Tipo</h2>
				</button>
				{convertToExcelModel.map((type) => (
					<button
						key={type}
						onClick={() => handleConvertToExcelModelChange(type)}
						className={`block w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${
							convertToExcelModelData === type
								? 'bg-blue-600 text-white'
								: 'hover:bg-gray-700'
						}`}
					>
						{type.toUpperCase()}
					</button>
				))}
			</aside>
			<main className="flex-1 p-6 bg-[#343541]">
				<h1 className="text-2xl font-bold mb-4">Convertir a Excel</h1>

				{/* Inputs para nombre archivo, hoja, fuente y tamaño */}
				<div className="mb-4 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<label className="block mb-1 font-semibold">
							Nombre de archivo
						</label>
						<input
							type="text"
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
							className="w-full p-2 rounded bg-[#40414f] border border-gray-600 text-white"
							placeholder="archivo"
						/>
					</div>
					<div>
						<label className="block mb-1 font-semibold">Nombre de hoja</label>
						<input
							type="text"
							value={sheetName}
							onChange={(e) => setSheetName(e.target.value)}
							className="w-full p-2 rounded bg-[#40414f] border border-gray-600 text-white"
							placeholder="Hoja1"
						/>
					</div>
					<div>
						<label className="block mb-1 font-semibold">Fuente</label>
						<input
							type="text"
							value={fontName}
							onChange={(e) => setFontName(e.target.value)}
							className="w-full p-2 rounded bg-[#40414f] border border-gray-600 text-white"
							placeholder="Calibri"
						/>
					</div>
					<div>
						<label className="block mb-1 font-semibold">Tamaño de fuente</label>
						<input
							type="number"
							min={1}
							max={72}
							value={fontSize}
							onChange={(e) => setFontSize(Number(e.target.value))}
							className="w-full p-2 rounded bg-[#40414f] border border-gray-600 text-white"
							placeholder="11"
						/>
					</div>
				</div>

				<textarea
					rows={10}
					className="w-full p-3 rounded bg-[#40414f] text-white border border-gray-600 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Pega tu JSON o Array aquí o arrastra un archivo..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				/>

				<div className="mb-4 flex flex-wrap gap-3 justify-between">
					<div className="flex gap-2 flex-wrap">
						<button
							onClick={() => handleExport('xlsx')}
							className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
						>
							<Download size={16} /> Exportar XLSX
						</button>
						<button
							onClick={() => handleExport('xls')}
							className="bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-yellow-700"
						>
							<Download size={16} /> Exportar XLS
						</button>
						<button
							onClick={() => handleExport('csv')}
							className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
						>
							<Download size={16} /> Exportar CSV
						</button>
					</div>

					<div className="flex gap-2">
						<button
							onClick={handleCopy}
							className="bg-gray-600 px-3 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
						>
							{copied ? <Check size={16} /> : <Clipboard size={16} />}
							{copied ? 'Copiado' : 'Copiar'}
						</button>
						<button
							onClick={handleClear}
							className="bg-red-600 px-3 py-2 rounded-md hover:bg-red-700"
						>
							Limpiar
						</button>
					</div>
				</div>

				{error && <p className="text-red-400 font-semibold">{error}</p>}
			</main>
		</div>
	)
}
