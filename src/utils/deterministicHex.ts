export function deterministicHex(input: string) {
    if (!input) {
        throw new Error("invalid input for deterministicHex")
    }

    let hash = new Array(32).fill(0); // Create 32-byte array (256 bits)

    for (let i = 0; i < input.length; i++) {
        hash[i % 32] = (hash[i % 32] * 31 + input.charCodeAt(i)) % 256; // Simple mixing
    }

    return hash.map(byte => byte.toString(16).padStart(2, '0')).join('');
}