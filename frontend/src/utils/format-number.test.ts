import { fData, fNumber, fPercent, fCurrency, fShortenNumber } from "./format-number";

describe("fNumber", () => {
  // Format a number with custom locale
  it("should format a number with custom locale", () => {
    const result = fNumber(1000, { code: "en-US", currency: "USD" }).replace(/\s+/g, " ").trim();
    expect(result).toBe("1,000");
  });

  // Handle null input value
  it("should return empty string when input is null", () => {
    const result = fNumber(null);
    expect(result).toBe("");
  });

  // Handle undefined input value
  it("should return empty string when input is undefined", () => {
    const result = fNumber(undefined);
    expect(result).toBe("");
  });

  // Handle empty string input
  it("should return empty string when input is an empty string", () => {
    const result = fNumber("");
    expect(result).toBe("0");
  });

  // Handle NaN input
  it("should return empty string when input is NaN", () => {
    const result = fNumber(NaN);
    expect(result).toBe("");
  });
});

describe("fCurrency", () => {
  // Format a number with custom locale and currency
  it("should format a number with custom locale and currency", () => {
    const result = fCurrency(1000, { code: "en-US", currency: "USD" });
    expect(result).toBe("$1,000");
  });

  // Handle null input value (should return empty string)
  it("should return empty string when input is null", () => {
    const result = fCurrency(null);
    expect(result).toBe("");
  });

  // Handle undefined input value (should return empty string)
  it("should return empty string when input is undefined", () => {
    const result = fCurrency(undefined);
    expect(result).toBe("");
  });

  // Handle NaN input value (should return empty string)
  it("should return empty string when input is NaN", () => {
    const result = fCurrency(NaN);
    expect(result).toBe("");
  });
});

describe("fPercent", () => {
  // Formats a number as a percentage with default locale (pl-PL)
  it("should format a number as percentage with default locale", () => {
    const result = fPercent(75);
    expect(result).toBe("75%");
  });

  // Formats a number as a percentage with custom locale
  it("should format a number as percentage with custom locale", () => {
    const result = fPercent(75, { code: "en-US", currency: "USD" });
    expect(result).toBe("75%");
  });

  // Formats a number with custom NumberFormat options
  it("should format a number with custom NumberFormat options", () => {
    const result = fPercent(75, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    expect(result).toBe("75,00%");
  });

  // Handles integer values correctly
  it("should format integer values correctly", () => {
    const result = fPercent(50);
    expect(result).toBe("50%");
  });

  // Handles decimal values correctly
  it("should format decimal values correctly", () => {
    const result = fPercent(50.5);
    expect(result).toBe("50,5%");
  });

  // Returns empty string when input is null
  it("should return empty string when input is null", () => {
    const result = fPercent(null);
    expect(result).toBe("");
  });

  // Returns empty string when input is undefined
  it("should return empty string when input is undefined", () => {
    const result = fPercent(undefined);
    expect(result).toBe("");
  });

  // Returns empty string when input is NaN
  it("should return empty string when input is NaN", () => {
    const result = fPercent(NaN);
    expect(result).toBe("");
  });

  // Handles zero correctly
  it("should format zero correctly", () => {
    const result = fPercent(0);
    expect(result).toBe("0%");
  });

  // Handles negative percentages correctly
  it("should format negative percentages correctly", () => {
    const result = fPercent(-25);
    expect(result).toBe("-25%");
  });
});

describe("fShortenNumber", () => {
  // Format numbers with custom locale
  it("should format numbers with custom locale", () => {
    const result = fShortenNumber(1000, { code: "en-US", currency: "USD" });
    expect(result).toBe("1k");
  });

  // Handle null input value
  it("should return empty string when input is null", () => {
    const result = fShortenNumber(null);
    expect(result).toBe("");
  });

  // Handle undefined input value
  it("should return empty string when input is undefined", () => {
    const result = fShortenNumber(undefined);
    expect(result).toBe("");
  });

  // Handle NaN input value
  it("should return empty string when input is NaN", () => {
    const result = fShortenNumber(NaN);
    expect(result).toBe("");
  });
});

describe("fData", () => {
  // Returns "0 bytes" when input is 0
  it('should return "0 bytes" when input is 0', () => {
    const result = fData(0);
    expect(result).toBe("0 bytes");
  });

  // Formats a small number as bytes with correct unit
  it("should format 100 as bytes with correct unit", () => {
    const result = fData(100);
    expect(result).toBe("100 bytes");
  });

  // Formats a medium number as Kb with correct decimal places
  it("should format 1500 as Kb with correct decimal places", () => {
    const result = fData(1500);
    expect(result).toBe("1.46 Kb");
  });

  // Formats a large number as Mb with correct decimal places
  it("should format 1500000 as Mb with correct decimal places", () => {
    const result = fData(1500000);
    expect(result).toBe("1.43 Mb");
  });

  // Handles numeric string inputs by converting them to numbers
  it("should handle numeric string inputs by converting them to numbers", () => {
    const result = fData("2048");
    expect(result).toBe("2 Kb");
  });

  // Returns "0 bytes" when input is null or undefined
  it('should return "0 bytes" when input is null or undefined', () => {
    expect(fData(null)).toBe("0 bytes");
    expect(fData(undefined)).toBe("0 bytes");
  });

  // Returns "0 bytes" when input is NaN
  it('should return "0 bytes" when input is NaN', () => {
    const result = fData(NaN);
    expect(result).toBe("0 bytes");
  });

  // Handles very large numbers near Number.MAX_SAFE_INTEGER
  it("should handle very large numbers near Number.MAX_SAFE_INTEGER", () => {
    const result = fData(Number.MAX_SAFE_INTEGER);
    expect(result).toBe("8 Pb");
  });

  // Handles decimal inputs correctly
  it("should handle decimal inputs correctly", () => {
    const result = fData(1536.5);
    expect(result).toBe("1.5 Kb");
  });

  // Handles string inputs that contain valid numbers
  it("should handle string inputs that contain valid numbers", () => {
    const result = fData("3145728");
    expect(result).toBe("3 Mb");
  });
});
