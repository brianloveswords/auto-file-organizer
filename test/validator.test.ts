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
            it("should not pass when it's not an array", () => {
                const [passed, errors] = new ConfigValidator({
                    firstKey: [["isArray"]],
                }).validate({
                    firstKey: 1,
                });
                expect(passed).toBe(false);
                expect(errors).toHaveLength(1);
                expect(errors[0].key).toBe("firstKey");
                expect(errors[0].validator).toBe("isArray");
            });
        });
    });
});
