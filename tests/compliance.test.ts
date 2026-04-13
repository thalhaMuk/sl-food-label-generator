import { describe, expect, it } from "vitest";
import { resolveColourForNutrient } from "../src/shared/compliance";

describe("Gazette threshold color mapping", () => {
  it("maps sugar boundaries correctly", () => {
    expect(resolveColourForNutrient("sugar", 4.99)).toBe("GREEN");
    expect(resolveColourForNutrient("sugar", 5)).toBe("AMBER");
    expect(resolveColourForNutrient("sugar", 22)).toBe("AMBER");
    expect(resolveColourForNutrient("sugar", 22.01)).toBe("RED");
  });

  it("maps salt boundaries correctly", () => {
    expect(resolveColourForNutrient("salt", 0.24)).toBe("GREEN");
    expect(resolveColourForNutrient("salt", 0.25)).toBe("AMBER");
    expect(resolveColourForNutrient("salt", 1.25)).toBe("AMBER");
    expect(resolveColourForNutrient("salt", 1.251)).toBe("RED");
  });

  it("maps fat boundaries correctly", () => {
    expect(resolveColourForNutrient("fat", 2.99)).toBe("GREEN");
    expect(resolveColourForNutrient("fat", 3)).toBe("AMBER");
    expect(resolveColourForNutrient("fat", 17.5)).toBe("AMBER");
    expect(resolveColourForNutrient("fat", 17.51)).toBe("RED");
  });
});
