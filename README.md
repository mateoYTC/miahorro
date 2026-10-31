# Mi Ahorro

App móvil para controlar gastos, ingresos y metas de ahorro. Hecha con Expo (React Native + TypeScript) y Supabase.

Integrantes:  Mateo Estrada Serna y María Camila Restrepo Izquierdo.

## Cómo ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo `.env` (copiar `.env.example`) con los datos de Supabase (Project Settings > API):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
3. Iniciar la app:
   ```bash
   npx expo start
   ```
   Luego escanear el QR con Expo Go, o presionar `w` para abrirla en el navegador.

## Configuración de Supabase

- **Authentication > Sign In / Providers > Email**: desactivar *Confirm email* para que el usuario entre apenas se registra.
- **SQL Editor**: ejecutar `supabase/crear_tablas.sql`. Crea las 5 tablas con sus llaves, activa RLS y crea las políticas (cada usuario solo ve sus datos). Si ya habías creado las tablas con una versión anterior, ejecuta `supabase/categorias_por_usuario.sql` (borra los datos de prueba de gastos y categorías).

## Base de datos

5 tablas relacionadas:

- `usuarios` (id_usuario, nombre, correo)
- `categorias` (id_categoria, nombre_categoria, id_usuario → usuarios): cada usuario tiene las suyas
- `gastos` (id_gasto, monto, fecha, descripcion, id_categoria → categorias, id_usuario → usuarios)
- `ingresos` (id_ingreso, monto, periodo, id_usuario → usuarios)
- `metas_ahorro` (id_meta_ahorro, nombre_meta, monto_objetivo, monto_actual, fecha_inicio, fecha_fin, id_usuario → usuarios)

## Funcionalidades

- Login y registro con validación de correo y contraseña (mínimo 6 caracteres).
- La sesión se guarda, no hay que iniciar sesión cada vez.
- Inicio con saldo, total de ingresos y gastos, gastos de hoy y del mes.
- CRUD de gastos (con categoría y filtro), ingresos, metas (con abonos y barra de progreso), categorías y perfil.
- Menú de pestañas abajo en todas las pantallas.

## Estructura

```
src/
├── components/   # Boton, Input, Tarjeta, ModalFormulario, Estados
├── context/      # AuthContext (sesión)
├── lib/          # Conexión a Supabase
├── navigation/   # Rutas y menú de pestañas
├── screens/      # Pantallas
├── services/     # Consultas a cada tabla
├── theme/        # Colores
├── types/        # Tipos de datos
└── utils/        # Alertas y formatos
```
