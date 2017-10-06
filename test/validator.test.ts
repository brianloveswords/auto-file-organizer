import { ConfigValidator } from "../src/validator";

describe("ConfigValidator", () => {
    describe("validators", () => {
        describe("#isArray", () => {
            it("should pass when it's an array", () => {
                const [passed, errors] = new ConfigValidator({
                    firstKey: [["isArray"]],
                }).validate({
                    firstKey: [],
                });
                expect(passed).toBe(true);
                expect(errors).toHaveLength(0);
            });
        });
    });
});
