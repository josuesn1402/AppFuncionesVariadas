export const languages = [
	'ts',
	'tsx',
	'js',
	'jsx',
	'json',
	'xml',
	'html',
	'css',
	'php',
	'bash',
	'markdown',
	'sql',
	'python',
	'java',
	'c',
	'ruby',
	'rust'
] as const

export type Language = (typeof languages)[number]
