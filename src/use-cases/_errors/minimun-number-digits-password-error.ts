export class MinumunNumberDigitsForPasswordError extends Error {
  constructor(minimunDigits: number) {
    super(`Nova senha deve conter no minimo ${minimunDigits} caracteres.`)
  }
}
