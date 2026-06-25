export function parseOklchString(oklchStr: string) {
  try {
    const match = oklchStr.match(
      /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i
    );
    if (!match) {
      throw new Error('Invalid OKLCH format');
    }

    const l = parseFloat(match[1]);
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);

    return { l, c, h };
  } catch (error) {
    return { l: 0, c: 0, h: 0 };
  }
}
export function oklchToHex({ l, c, h }: { l: number; c: number; h: number }) {
  try {
    // Convert hue to radians
    const hRad = (h * Math.PI) / 180;

    // Convert OKLCH to OKLab
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // OKLab to LMS
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    // LMS to linear sRGB
    const lCubed = l_ ** 3;
    const mCubed = m_ ** 3;
    const sCubed = s_ ** 3;

    let r =
      +4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
    let g =
      -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
    let bVal =
      -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

    // Linear RGB to gamma-corrected sRGB
    const toSRGB = (x: number) =>
      x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

    r = toSRGB(r);
    g = toSRGB(g);
    bVal = toSRGB(bVal);

    // Clamp, convert to hex
    const toHex = (x: number) =>
      Math.max(0, Math.min(255, Math.round(x * 255)))
        .toString(16)
        .padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
  } catch (error) {
    return '#000000';
  }
}
