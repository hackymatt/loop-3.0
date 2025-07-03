import { createMetadata } from "./create-metadata";

describe("createMetadata", () => {
  const defaultMetadata = {
    title: "Test title",
    description: "Test description",
    path: "/test-path",
  };
  // Function returns correct metadata object with default values when no parameters are provided
  it("should return metadata with default values when no parameters are provided", () => {
    // Mock CONFIG
    jest.mock("src/global-config", () => ({
      CONFIG: {
        appName: "loop",
      },
    }));

    const result = createMetadata(defaultMetadata);

    expect(result).toEqual({
      title: `${defaultMetadata.title} • loop`,
      description: defaultMetadata.description,
      alternates: {
        canonical: "https://loop.edu.pl/test-path",
      },
      openGraph: {
        type: "website",
        url: "https://loop.edu.pl/test-path",
        images: "https://loop.edu.pl/logo/logo.svg",
        title: `${defaultMetadata.title} • loop`,
        description: defaultMetadata.description,
      },
    });
  });

  // Function correctly formats title by appending appName from CONFIG
  it("should format title by appending appName from CONFIG", () => {
    // Mock CONFIG
    jest.mock("src/global-config", () => ({
      CONFIG: {
        appName: "loop",
      },
    }));

    const customTitle = "Custom Title";
    const result = createMetadata({ ...defaultMetadata, title: customTitle });

    expect(result.title).toBe(`${customTitle} • loop`);
    expect(result.openGraph.title).toBe(`${customTitle} • loop`);
  });

  // Function correctly constructs canonical URL with provided path
  it("should construct canonical URL with provided path", () => {
    // Mock CONFIG
    jest.mock("src/global-config", () => ({
      CONFIG: {
        appName: "loop",
      },
    }));

    const customPath = "/test-path";
    const result = createMetadata({ ...defaultMetadata, path: customPath });

    expect(result.alternates.canonical).toBe(`https://loop.edu.pl${customPath}`);
  });

  // Function correctly constructs OpenGraph URL with provided path
  it("should construct OpenGraph URL with provided path", () => {
    // Mock CONFIG
    jest.mock("src/global-config", () => ({
      CONFIG: {
        appName: "loop",
      },
    }));

    const customPath = "/test-path";
    const result = createMetadata({ ...defaultMetadata, path: customPath });

    expect(result.openGraph.url).toBe(`https://loop.edu.pl${customPath}`);
  });

  // Function handles undefined image by using default logo URL
  it("should use default logo URL when image is undefined", () => {
    // Mock CONFIG
    jest.mock("src/global-config", () => ({
      CONFIG: {
        appName: "loop",
      },
    }));

    const result = createMetadata(defaultMetadata);

    expect(result.openGraph.images).toBe("https://loop.edu.pl/logo/logo.svg");
  });
});
