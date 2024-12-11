export function dbPhoneFormatting(dbPhone: string) {
    let phone = ''
    if (dbPhone.startsWith('+7')) {
        for (let i = 0; i < dbPhone.length; i++) {
            if (i === 2) phone += ' (';
            if (i === 5) phone += ') ';
            if (i === 8 || i === 10) phone += '-';
            phone += dbPhone[i];
        }
    } else {
        phone = dbPhone
    }
    return phone
}