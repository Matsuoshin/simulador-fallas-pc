# Simulador de fallas de PC — React

Simulador educativo para practicar diagnóstico de fallas comunes de computadores.

## Incluye

Los casos están separados en dos secciones, porque varias fallas son propias de cada tipo de equipo.

### PC de escritorio (11)

- Sobrecalentamiento de CPU
- Pantallazo azul por RAM
- Disco duro deteriorado
- Disco del sistema lleno
- GPU sobrecalentada / artefactos
- Reinicios por fuente de poder
- Windows no inicia
- Flujo de aire bloqueado por polvo
- Pila CMOS agotada (la hora y la BIOS se reinician)
- Enciende pero no da imagen (RAM mal insertada)
- Capacitores inflados en la placa base

### Portátil (7)

- Chip de video desoldado por sobrecalentamiento (soldaduras BGA, reballing)
- Portátil caliente y lento (disipador obstruido)
- Batería hinchada
- No carga la batería (conector DC jack)
- Pantalla parpadea al mover la tapa (bisagra y cable flex)
- Imagen muy oscura (retroiluminación)
- Líquido derramado en el teclado

Cada caso incluye:

1. Síntomas
2. Lecturas del sistema
3. Pruebas de diagnóstico
4. Selección de hipótesis
5. Explicación de la causa real
6. Reparación paso a paso
7. Recomendaciones de prevención

## Uso

- Navega entre etapas con la barra de progreso (solo se habilitan las etapas alcanzadas).
- Activa o desactiva las pistas de aprendizaje; en ese modo, un diagnóstico errado sugiere la prueba clave.
- El progreso (casos resueltos, último caso y preferencia de pistas) se guarda en el navegador.
- Funciona con teclado, lector de pantalla, modo oscuro y pantallas móviles.

## Ejecutar

```bash
npm install
npm run dev
```

Luego abre la dirección que muestre Vite, normalmente `http://localhost:5173`.

## Compilar

```bash
npm run build
```
