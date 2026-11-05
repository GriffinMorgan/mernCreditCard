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

module.exports = { isValidExpirationFormat, isExpired };