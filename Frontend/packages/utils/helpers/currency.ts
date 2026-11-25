/**
 * Currency formatting helpers — shared across apps.
 */

/**
 * Formats a numeric price value to a display string.
 * @param value  — the numeric price
 * @param locale — BCP-47 locale string (default: "pt-BR")
 * @param currency — ISO 4177 currency code (default: "BRL")
 */
export function formatPrice(
    value: number,
    locale: string = "pt-BR",
    currency: string = "BRL"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
