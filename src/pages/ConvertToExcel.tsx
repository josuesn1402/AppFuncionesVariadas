import { useState } from 'react'
import { Clipboard, Check, ChevronLeft, Download } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

import type { PageProps } from '../models/props'
import {
	convertToExcelModel,
	type ConvertToExcelModel
} from '../models/ConvertToExcel'

type Format = 'xlsx' | 'xls' | 'csv'

const parseInput = (input: string, type: ConvertToExcelModel): any[] => {
	try {
		const parsed = eval(`(${input})`)
		if (type === 'json') {
			if (Array.isArray(parsed)) return parsed
			return [parsed]
		} else if (type === 'array') {
			return parsed
		}
		return []
	} catch {
		return []
	}
}

const exportToExcel = (data: any[], format: Format, fileName = 'archivo') => {
	const processedData = data.map((row) => {
		const newRow: Record<string, any> = {}
		Object.entries(row).forEach(([key, value]) => {
			if (typeof value === 'string') {
				// Intentar convertir a número
				const num = Number(value)
				if (!isNaN(num) && value.trim() !== '') {
					newRow[key] = num
					return
				}

				// Intentar convertir a fecha válida
				const date = new Date(value)
				if (!isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
					newRow[key] = date
					return
				}

				// Si no es número ni fecha válida, dejar como string
				newRow[key] = value
			} else {
				newRow[key] = value
			}
		})
		return newRow
	})

	const worksheet = XLSX.utils.json_to_sheet(processedData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1')
	const extension = format === 'csv' ? 'csv' : 'xlsx'
	const excelBuffer = XLSX.write(workbook, { bookType: format, type: 'array' })
	const blob = new Blob([excelBuffer], {
		type:
			format === 'csv'
				? 'text/csv;charset=utf-8;'
				: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	})
	saveAs(blob, `${fileName}.${extension}`)
}

export default function ConvertToExcel({ changeView }: PageProps) {
	const [convertToExcelModelData, setConvertToExcelModelData] =
		useState<ConvertToExcelModel>('json')
	const [input, setInput] = useState('')
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleExport = (format: Format) => {
		setError(null)
		try {
			const data = parseInput(input, convertToExcelModelData)
			if (!Array.isArray(data))
				throw new Error('La entrada no es un array válido.')
			exportToExcel(data, format)
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

	return (
		<div className="min-h-screen flex bg-[#1e1e1e] text-white font-sans">
			<aside className="w-52 bg-[#202123] text-white p-4 space-y-1.5 border-r border-gray-700">
				<div className="flex items-center gap-x-1.5 text-lg font-semibold mb-4">
					<button className="cursor-pointer" onClick={changeView}>
						<ChevronLeft />
					</button>
					<h2>Tipo</h2>
				</div>
				{convertToExcelModel.map((lang) => (
					<button
						key={lang}
						onClick={() => handleConvertToExcelModelChange(lang)}
						className={`block w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${
							convertToExcelModelData === lang
								? 'bg-blue-600 text-white'
								: 'hover:bg-gray-700'
						}`}
					>
						{lang.toUpperCase()}
					</button>
				))}
			</aside>
			<main className="flex-1 p-6 bg-[#343541]">
				<h1 className="text-2xl font-bold mb-4">Convertir a Excel</h1>
				<textarea
					rows={10}
					className="w-full p-3 rounded bg-[#40414f] text-white border border-gray-600 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Pega tu JSON o Array aquí..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<div className="mb-4 flex flex-wrap gap-3 justify-between">
					<div className="flex gap-2 flex-wrap">
						<button
							onClick={() => handleExport('xlsx')}
							className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
						>
							<Download size={16} />
							Exportar XLSX
						</button>
						<button
							onClick={() => handleExport('xls')}
							className="bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-yellow-700"
						>
							<Download size={16} />
							Exportar XLS
						</button>
						<button
							onClick={() => handleExport('csv')}
							className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
						>
							<Download size={16} />
							Exportar CSV
						</button>
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
									<Clipboard size={16} /> Copiar entrada
								</>
							)}
						</button>
					</div>
					<button
						onClick={handleClear}
						className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
					>
						Limpiar campo
					</button>
				</div>
				{error && (
					<div className="mb-4 p-3 bg-red-700 text-white rounded">
						<strong>Error:</strong> {error}
					</div>
				)}
			</main>
		</div>
	)
}
