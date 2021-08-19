// Data Validation
export function isNull(field) {
    return field === null || field === undefined || field === ""
}

export function isEmail(email) {
    const validEmailRegex = RegExp(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i)
    return validEmailRegex.test(email)
}

export function isValidDropdown(index) {
    return index !== 0
}

export function isStrongPassword(pwd) {
    const strongPasswordRegex = RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})')
    return strongPasswordRegex.test(pwd)
}

export function isDateValid(date) {
    const today = new Date()
    return today > new Date(date)
}

// Error Messages
export const NULL_MSG = "Please fill in this field"
export const INCORRECT_EMAIL_MSG = "Invalid email address"
export const INVALID_DROPDOWN_SELECTION = "Invalid selection, please choose a valid option"
export const WEAK_PASSWORD_MSG = "Your password is too weak, it should be at least 8 characters long, have 1 uppercase letter, 1 lowercase letter and 1 digit"
export const INVALID_DATE = "Invalid Date. You cannot choose a date in the future"

// Get Error Messages
export const getTextErrorMsg = (text) => isNull(text) ? NULL_MSG : ''
export const getEmailErrorMsg = (email) => isNull(email) ? NULL_MSG : (!isEmail(email) ? INCORRECT_EMAIL_MSG : '')
export const getDropdownErrorMsg = (value, index) => isNull(value) ? NULL_MSG : !isValidDropdown(index) ? INVALID_DROPDOWN_SELECTION : ''
export const getPasswordErrorMsg = (pwd) => isStrongPassword(pwd) ? '' : WEAK_PASSWORD_MSG
export const getDateErrorMsg = (date) => isDateValid(date) ? '' : INVALID_DATE