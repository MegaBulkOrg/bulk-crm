export function tzDateStringToCommonDateString(date: string) {
    const dateObject = new Date(date)
    const day = dateObject.getDate().toString().padStart(2, '0')
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObject.getFullYear()
    return `${day}.${month}.${year}`
}

export function tzDateStringToCommonDateStringForForms(date: string) {
    const dateObject = new Date(date)
    const day = dateObject.getDate().toString().padStart(2, '0')
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObject.getFullYear()
    return `${year}-${month}-${day}`
}