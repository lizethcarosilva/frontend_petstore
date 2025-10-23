# 🔐 Encriptación de Contraseñas - BCrypt

## ❗ IMPORTANTE: Cómo Funciona la Encriptación

### 🎯 Proceso de Login

1. **El usuario ingresa** su contraseña en texto plano: `"12345"`
2. **El frontend envía** la contraseña en texto plano al backend (esto es **CORRECTO**)
3. **El backend recibe** la contraseña en texto plano
4. **El backend compara** usando BCrypt:
   ```java
   BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
   boolean matches = encoder.matches(passwordTextoPlano, passwordEncriptado);
   ```
5. **Si coincide**, devuelve token JWT y datos del usuario

### ✅ LO QUE ES CORRECTO

- ✅ El frontend envía la contraseña **en texto plano**
- ✅ El backend almacena la contraseña **encriptada** con BCrypt
- ✅ El backend compara **automáticamente** con BCrypt
- ✅ La comunicación debe ser por **HTTPS** en producción

### ❌ LO QUE NO SE DEBE HACER

- ❌ NO encriptar la contraseña en el frontend
- ❌ NO enviar la contraseña encriptada al backend
- ❌ NO usar HTTP en producción (solo HTTPS)

## 🔧 Configuración Backend (Ya implementada)

```java
@Configuration
public class PasswordConfig {
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## 📝 Crear Usuario con Contraseña Encriptada

### Opción 1: Usar el endpoint de creación
```bash
POST /api/users/create
{
  "name": "Admin",
  "tipo_id": "CC",
  "ident": "12345678",
  "correo": "admin@petstore.com",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "password": "12345",  // Se envía en texto plano
  "rol_id": "ADMIN"
}
```

El backend se encarga de encriptarla automáticamente.

### Opción 2: Insertar manualmente en la base de datos

Si necesitas insertar un usuario directamente en la base de datos:

```sql
-- Primero, genera el hash de la contraseña
-- En Java/Spring Shell:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hash = encoder.encode("12345");
-- System.out.println(hash);
-- Resultado: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO "user" (name, tipo_id, ident, correo, telefono, direccion, password, rol_id, activo)
VALUES (
  'Admin',
  'CC',
  '12345678',
  'admin@petstore.com',
  '3001234567',
  'Calle 123',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- contraseña: "12345"
  'ADMIN',
  true
);
```

## 🔍 Verificar Contraseña Encriptada

### Script SQL para verificar usuario
```sql
SELECT user_id, name, correo, password, rol_id, activo
FROM "user"
WHERE correo = 'admin@petstore.com';
```

### Formato del Hash BCrypt
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│││ │└─ Hash único (53 caracteres)
││││
│││└─ Rounds (10 = 2^10 = 1024 iteraciones)
││└─ Versión del algoritmo
│└─ Identificador BCrypt
└─ Identificador BCrypt
```

## 🧪 Testing

### 1. Verificar que el usuario existe
```bash
curl http://localhost:8090/api/users
```

### 2. Intentar login
```bash
curl -X POST http://localhost:8090/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@petstore.com",
    "password": "12345"
  }'
```

### 3. Respuesta esperada
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "Admin",
    "correo": "admin@petstore.com",
    "rol_id": "ADMIN",
    ...
  }
}
```

## 🐛 Problemas Comunes

### Problema 1: "Usuario no encontrado"
**Causa:** El correo no existe en la base de datos

**Solución:**
```sql
SELECT * FROM "user" WHERE correo = 'tu_correo@example.com';
```

### Problema 2: "Contraseña incorrecta"
**Causa:** La contraseña no coincide con el hash almacenado

**Solución:**
1. Verifica que estás usando la contraseña correcta
2. Verifica que el hash en la BD es válido
3. Prueba crear un nuevo usuario

### Problema 3: "Login exitoso: undefined"
**Causa:** El backend no está devolviendo el objeto `user` en la respuesta

**Solución:** Verificar la clase `LoginResponse` del backend:

```java
public class LoginResponse {
    private String token;
    private User user;  // ← Debe incluir el usuario
    
    // Getters y Setters
}
```

## 🔒 Seguridad en Producción

### 1. HTTPS Obligatorio
```nginx
# Configuración Nginx
server {
    listen 443 ssl;
    server_name api.petstore.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### 2. Variables de Entorno
```properties
# application.properties
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:3600000}
```

### 3. Rate Limiting
```java
// Implementar límite de intentos de login
@RateLimiter(name = "loginLimiter", fallbackMethod = "loginFallback")
public LoginResponse login(LoginDto data) {
    // ...
}
```

## 📚 Referencias

- [BCrypt Documentation](https://en.wikipedia.org/wiki/Bcrypt)
- [Spring Security BCrypt](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-bcrypt)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## ✅ Checklist de Seguridad

- [x] Contraseñas se almacenan encriptadas con BCrypt
- [x] Frontend envía contraseñas en texto plano (sobre HTTPS)
- [x] Backend compara con BCrypt automáticamente
- [ ] Usar HTTPS en producción
- [ ] Implementar rate limiting para login
- [ ] Configurar JWT con expiración
- [ ] Implementar refresh tokens
- [ ] Agregar 2FA (opcional)

