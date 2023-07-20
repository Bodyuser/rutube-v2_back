import { generateCode } from './generateCode'

export const generateName = (names: string[]) => {
	const name = `channel${generateCode(9)}`
	if (!names.includes(name)) {
		return name
	} else {
		return generateName(names)
	}
}
