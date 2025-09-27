import { describe, it, expect } from '@jest/globals';

describe('Basic Tests', () => {
    it('should pass basic math', () => {
        expect(2 + 2).toBe(4);
    });

    it('should validate string', () => {
        const text = "Hello World";
        expect(text).toBe("Hello World");
    });

    it('should check array length', () => {
        const arr = [1, 2, 3];
        expect(arr.length).toBe(3);
    });
});