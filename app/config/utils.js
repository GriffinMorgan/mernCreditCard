// Checks that a date string is in MM/YYYY format (e.g. "09/2029")
const isValidExpirationFormat = (expirationDate) => {
    return /^(0[1-9]|1[0-2])\/\d{4}$/.test(expirationDate);
};

// Returns true if the card has expired.
// A card stays valid through the last day of its expiration month.
const isExpired = (expirationDate) => {
    const [month, year] = expirationDate.split("/").map(Number);

    // Month in JS Date is 0-indexed, so passing `month` gives the first day of the NEXT month
    const firstDayAfterExpiration = new Date(year, month, 1);

    return new Date() >= firstDayAfterExpiration;
};

// Checks that a password is at least 8 characters and contains a special character.
const isPasswordValid = (password) => {
    if (typeof password !== 'string' || password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters long' };
    }
    // Special character = anything that isn't a letter, digit or whitespace
    if (!/[^A-Za-z0-9\s]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' };
    }
    return { valid: true };
};

module.exports = { isValidExpirationFormat, isExpired, isPasswordValid };