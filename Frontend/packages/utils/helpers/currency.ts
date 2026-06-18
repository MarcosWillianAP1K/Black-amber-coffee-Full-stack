/**
 * Currency formatting helpers — shared across apps.
 */

/**
 * Formats a numeric price value to a display string.
 * @param value  — the numeric price
 * @param locale — BCP-47 locale string (default: "en-US")
 * @param currency — ISO 4217 currency code (default: "USD")
 */
export function formatPrice(
    value: number,
    locale: string = "en-US",
    currency: string = "USD"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
