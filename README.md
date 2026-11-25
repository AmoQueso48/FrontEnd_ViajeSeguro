# SmartRoute - Sistema de Gestión de Flota ViajeSeguro

Aplicación web frontend desarrollada para la asignatura Desarrollo Fullstack II (DSY1104).
Permite a clientes, conductores y administradores gestionar solicitudes de viaje, órdenes de viaje y asignación de vehículos.

## Tecnologías

- React con Vite
- React Router para la navegación entre portales
- Bootstrap y React-Bootstrap para el diseño responsivo
- Vitest y Testing Library para las pruebas unitarias

## Ejecución

```bash
npm install
npm run dev
```

## Pruebas

```bash
npm test
npm run coverage
```

El reporte de cobertura se genera en la carpeta `coverage`.

## Estructura

```
src/
  components/   Header, Footer y Boton reutilizables
  pages/        Login, ClienteHome, ConductorHome y AdminHome
  test/         utilidades compartidas por las pruebas
```
