export const convertToExcelModel = ['json', 'array'] as const

export type ConvertToExcelModel = (typeof convertToExcelModel)[number]
