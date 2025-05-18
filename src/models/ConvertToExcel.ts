export const convertToExcelModel = ['json', 'array.ts', 'array.js'] as const

export type ConvertToExcelModel = (typeof convertToExcelModel)[number]
