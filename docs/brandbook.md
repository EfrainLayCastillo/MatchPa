# Brandbook

Deportivo, urbano y fresco: lima brillante sobre verde profundo, con turquesa como acento y fondo marfil. Tipografía bold enorme, acentos manuscritos y fotografía con grano.

| Color | Hex | RGB | Uso |
|---|---|---|---|
| Marfil | `#f5f0f0` | 245, 240, 240 | Fondo claro |
| Lima | `#e6fa50` | 230, 250, 80 | Principal: botones, estados disponibles, fondos de impacto |
| Turquesa | `#50c8c8` | 80, 200, 200 | Acento: chips y datos secundarios |
| Verde profundo | `#003c3c` | 0, 60, 60 | Texto sobre marfil, fondos oscuros, texto sobre lima |

Los colores vienen de una paleta de referencia visual. El logo de esa referencia no se usa. Los tonos de superficie (tarjetas, bordes, texto secundario) son derivados de estos cuatro.

- **Tipografía:** títulos en grotesca bold (Bricolage Grotesque o Archivo), acentos en script (Yellowtail), texto en Inter.
- **Logo:** **Match** en bold + **Pa** en script.
- **Gráficos:** estrella de 4 puntas, globo en alambre, carita sonriente en línea, trazos de la pelota.
- **Tono:** casual y panameño: "Ey Pa, ¿juegas?", "Buscando Pa's...", "¡Match! Ya están los 4".

## Errores y avisos

El error usa el naranja `destructive` (`#c2410c`), nunca texto rojo suelto. Los avisos de éxito usan lima e íconos en verde profundo, sin verdes nuevos.

| Caso | Patrón |
|---|---|
| Campo inválido (validación local o 422 con `field`) | Borde y anillo naranja en el campo, mensaje debajo y foco en el primer campo inválido |
| Error de formulario sin campo (credenciales, código, 409) | Alerta en bloque dentro del formulario: fondo naranja tenue e ícono |
| Acción puntual fallida (unirse, salir, cancelar, red) o éxito | Toast abajo a la derecha. En mobile ocupa el ancho y queda sobre la barra de acción |
| Falla al cargar una pantalla | Tarjeta con "Reintentar" |
