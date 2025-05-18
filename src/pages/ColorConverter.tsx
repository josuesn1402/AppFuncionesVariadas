import { useState } from 'react'
import Color from 'colorjs.io'
import type { PageProps } from '../models/props'
import { ChevronLeft } from 'lucide-react'

export default function ColorConverter({ changeView }: PageProps) {
	const [input, setInput] = useState('')
	const [color, setColor] = useState<Color | null>(null)

	const handleConvert = () => {
		try {
			const trimmed = input.trim()
			if (/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(trimmed)) {
				setColor(new Color(trimmed))
				return
			}
			setColor(new Color(trimmed))
		} catch (error) {
			console.error('Formato de color no reconocido:', error)
			setColor(null)
		}
	}

	const format = (c: Color, space: string) => {
		try {
			const converted = c.to(space)
			return converted.toString({ precision: 4 })
		} catch {
			return 'No disponible'
		}
	}

	const contrastAgainst = (c: Color, bg: string) => {
		try {
			return c.contrast(new Color(bg), 'WCAG21').toFixed(2)
		} catch {
			return 'Error'
		}
	}

	return (
		<div className="min-h-screen flex bg-[#1e1e1e] text-white font-sans p-6 max-w-xl mx-auto">
			<div className="w-full">
				<button
					className="flex items-center gap-x-1.5 text-lg font-semibold mb-4 cursor-pointer w-full"
					onClick={changeView}
				>
					<ChevronLeft />
					<h2>Convertidor de Color</h2>
				</button>

				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ingresa un color (ej. #f00, oklch(...), etc.)"
					className="w-full p-3 rounded bg-[#40414f] border border-gray-600 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
				/>

				<button
					onClick={handleConvert}
					className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors mb-6"
				>
					Convertir
				</button>

				{color && (
					<div className="space-y-4">
						<div
							className="w-24 h-24 rounded shadow border border-gray-700"
							style={{ backgroundColor: color.toString() }}
							aria-label="Muestra de color"
						/>

						<div className="grid grid-cols-2 gap-3 text-sm">
							<p>
								<strong>HEX:</strong>{' '}
								{color.to('srgb').toString({ format: 'hex' })}
							</p>
							<p>
								<strong>RGB:</strong> {format(color, 'srgb')}
							</p>
							<p>
								<strong>RGBA:</strong> {format(color, 'srgb')}, α={' '}
								{color.alpha.toFixed(2)}
							</p>
							<p>
								<strong>HSL:</strong> {format(color, 'hsl')}
							</p>
							<p>
								<strong>HWB:</strong> {format(color, 'hwb')}
							</p>
							<p>
								<strong>LCH:</strong> {format(color, 'lch')}
							</p>
							<p>
								<strong>LAB:</strong> {format(color, 'lab')}
							</p>
							<p>
								<strong>OKLCH:</strong> {format(color, 'oklch')}
							</p>
							<p>
								<strong>OKLAB:</strong> {format(color, 'oklab')}
							</p>
							<p>
								<strong>XYZ:</strong> {format(color, 'xyz-d65')}
							</p>
							<p>
								<strong>LUV:</strong> {format(color, 'luv')}
							</p>
							<p>
								<strong>CMYK:</strong> {format(color, 'cmyk')}
							</p>
							<p>
								<strong>Lightness:</strong> {color.l ?? 'N/A'}
							</p>
							<p>
								<strong>Chroma:</strong> {color.c ?? 'N/A'}
							</p>
							<p>
								<strong>Hue:</strong> {color.h ?? 'N/A'}
							</p>
							<p>
								<strong>Alpha:</strong> {color.alpha}
							</p>
							<p>
								<strong>Contraste con blanco:</strong>{' '}
								{contrastAgainst(color, '#fff')}
							</p>
							<p>
								<strong>Contraste con negro:</strong>{' '}
								{contrastAgainst(color, '#000')}
							</p>
						</div>

						<div className="flex gap-3 mt-6">
							{[-0.4, -0.2, 0, 0.2, 0.4].map((mod) => {
								const modColor = color.clone()
								modColor.oklch.l = Math.min(
									Math.max(modColor.oklch.l + mod, 0),
									1
								)
								return (
									<div
										key={mod}
										className="w-12 h-12 border border-gray-700 rounded"
										style={{ backgroundColor: modColor.toString() }}
										title={`L: ${(modColor.oklch.l * 100).toFixed(1)}%`}
									/>
								)
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
