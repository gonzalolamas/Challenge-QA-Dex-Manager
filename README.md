# Challenge QA automation - Dex Manager

Este proyecto contiene la suite de pruebas automatizadas para la plataforma **Dex Manager**, enfocada específicamente en la validación funcional de la **Librería de Medios (Gestión y Carga de Contenidos Multimedia)**. 

La automatización fue desarrollada utilizando **Playwright** con **TypeScript**, implementando el patrón de diseño **Page Object Model (POM)** para garantizar un código limpio, mantenible y escalable.

---

## 🛠️ Requisitos Previos

Antes de instalar y ejecutar el proyecto, tener instalado:
* [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
* Un editor de código (como Visual Studio Code)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
Clónalo y navega hacia la carpeta raíz:
```
git clone <URL_DEL_REPOSITORIO>
cd Challenge-QA-Dex-Manager
```

### 2. Instalar dependencias del proyecto
Ejecuta el siguiente comando para descargar todos los paquetes necesarios (Playwright, TypeScript, Dotenv, tipos globales de Node, etc.):

Bash
npm install

### 3. Instalar los navegadores de Playwright
Descarga los binarios aislados de los navegadores que utiliza el motor de pruebas:

Bash
npx playwright install

### 4. Configurar las Variables de Entorno
El proyecto utiliza un archivo .env para proteger las credenciales de acceso y centralizar las URLs.

* Crea un archivo llamado .env en la raíz del proyecto (al mismo nivel que el package.json).

* Agrega las siguientes variables con los datos provistos para el desafío:

Fragmento de código:

BASE_URL=[https://demo4.dexmanager.com/](https://demo4.dexmanager.com/)
DEX_USER=challengeqa
DEX_PASSWORD=qwerty1

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura estricta de Page Object Model (POM) para separar la lógica de los elementos de la interfaz de la lógica propia de los casos de prueba:


Challenge-QA-Dex-Manager/
├── src/
│   ├── fixtures/          # Archivos locales estáticos para simular subidas (ej. sample.png)
│   ├── pages/             # Clases POM (Definición de locators y métodos de interacción)
│   │   ├── login.page.ts
│   │   └── dashboard.page.ts
│   └── tests/             # Scripts de prueba estructurados (Test Suites)
│       └── login.spec.ts
│       └── media-content.spec.ts
├── .env                   # Variables de entorno (Credenciales y URLs ocultas)
├── package.json           # Dependencias, scripts de ejecución y metadatos del proyecto
├── playwright.config.ts   # Configuración global de Playwright (Timeouts, browsers, reportes)
├── tsconfig.json          # Configuración del compilador de TypeScript
└── README.md              # Documentación técnica del repositorio

Componentes Clave:

src/pages/: Contiene la abstracción de las pantallas. Cada archivo describe los selectores estables (priorizando roles y texto) y las acciones que un usuario puede realizar en esa vista.

src/tests/: Contiene las aserciones, precondiciones (beforeEach) y la lógica secuencial de los escenarios de prueba.

---

## 🧪 Ejecución de los Tests

Podés ejecutar la suite de pruebas utilizando la consola mediante diferentes modalidades provistas por Playwright:

A. Interfaz Gráfica (UI Mode - Recomendado para evaluar)
Abre el entorno interactivo donde podrás ver los tests en árbol, ejecutarlos de a uno, ver trazas de red, consolas y snapshots paso a paso:

npx playwright test --ui

---

## 📊 Reportes de Pruebas

Genera automáticamente un reporte HTML interactivo y detallado al finalizar cada ejecución por consola. Para visualizar el último reporte generado con estadísticas de éxito, tiempos y capturas ante fallos, ejecutá:

npx playwright show-report