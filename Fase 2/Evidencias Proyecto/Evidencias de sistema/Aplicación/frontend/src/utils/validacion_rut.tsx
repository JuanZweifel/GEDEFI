export function validarRut(rut: String) {
  try {
    if (!rut) throw new Error("El RUT está vacío.");

    rut = rut.replace(/\./g, "").toUpperCase();

    const [numeroStr, dv] = rut.split("-");
    if (!numeroStr || !dv) throw new Error("Formato inválido (falta guion).");

    const numero = parseInt(numeroStr, 10);
    if (isNaN(numero)) throw new Error("El número del RUT no es válido.");

    // Calculate check digit
    let suma = 0;
    let multiplicador = 2;
    for (let i = numeroStr.length - 1; i >= 0; i--) {
      suma += parseInt(numeroStr[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    let dvCalculado;
    if (resto === 11) dvCalculado = "0";
    else if (resto === 10) dvCalculado = "K";
    else dvCalculado = String(resto);

    if (dvCalculado === dv) {
      return true;
    } else {
      throw new Error("El RUT no es válido.");
    }
  } catch (err) {
    console.error(err.message);
    return false;
  }
}
