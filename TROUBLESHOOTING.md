# 🔧 Solución de Problemas Comunes

## ❌ Error: "undefined" is not valid JSON

### Descripción del Error
```
Uncaught SyntaxError: "undefined" is not valid JSON
at JSON.parse (<anonymous>)
at AuthContext.tsx:33
```

### Causa
El localStorage contiene el string `"undefined"` de un login anterior que no devolvió el objeto `user` correctamente.

### Solución

#### Opción 1: Limpiar desde la Consola del Navegador
1. Abre la consola del navegador (F12)
2. Ejecuta:
```javascript
localStorage.clear();
```
3. Refresca la página (F5)

#### Opción 2: Limpiar Items Específicos
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
```

#### Opción 3: Verificar y Limpiar
```javascript
// Ver qué hay almacenado
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Limpiar si es necesario
if (localStorage.getItem('user') === 'undefined') {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}
```

### Prevención
El código ya fue actualizado para manejar este caso automáticamente. Si detecta `'undefined'` en el localStorage, lo limpia automáticamente.

---

## ❌ Error: CORS Policy

### Descripción del Error
```
Access to XMLHttpRequest at 'http://localhost:8090/api/users' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

### Solución
Ver archivo `CORS_SETUP.md` para configurar CORS en el backend.

---

## ❌ Error: Usuario no encontrado

### Verificar que el usuario existe
```sql
SELECT * FROM "user" WHERE correo = 'tu_email@example.com';
```

### Crear usuario de prueba
```sql
INSERT INTO "user" (name, tipo_id, ident, correo, telefono, direccion, password, rol_id, activo)
VALUES (
  'Admin Test',
  'CC',
  '12345678',
  'admin@test.com',
  '3001234567',
  'Calle 123',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: "12345"
  'ADMIN',
  true
);
```

---

## ❌ Error: Login exitoso pero user es undefined

### Causa
El backend está devolviendo un token pero no el objeto `user` en la respuesta.

### Verificar Respuesta del Backend
```javascript
// En la consola del navegador, después de hacer login
// Deberías ver estos logs:
console.log('Respuesta completa del backend:', response);
console.log('Datos de la respuesta:', response.data);
```

### Verificar LoginResponse en el Backend
Asegúrate de que la clase `LoginResponse` incluya el usuario:

```java
public class LoginResponse {
    private String token;
    private User user;  // ← Debe estar presente
    
    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }
    
    // Getters y Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
```

### Verificar LoginService
```java
public LoginResponse login(LoginDto data) {
    Optional<User> userOpt = userRepository.findByCorreo(data.getCorreo());
    
    if (userOpt.isEmpty()) {
        throw new RuntimeException("Usuario no encontrado");
    }
    
    User user = userOpt.get();
    
    if (!passwordEncoder.matches(data.getPassword(), user.getPassword())) {
        throw new RuntimeException("Contraseña incorrecta");
    }
    
    String token = jwtTokenProvider.createToken(user);
    
    // IMPORTANTE: Devolver tanto el token como el usuario
    return new LoginResponse(token, user);
}
```

---

## ❌ Error: Network Error / ERR_CONNECTION_REFUSED

### Causa
El backend no está ejecutándose.

### Solución
1. Verifica que el backend esté corriendo:
```bash
# En el directorio del backend
./mvnw spring-boot:run
```

2. Verifica que esté en el puerto correcto:
```
http://localhost:8090
```

3. Verifica la URL en `.env`:
```env
VITE_API_URL=http://localhost:8090
```

---

## 🔍 Herramientas de Depuración

### Ver Estado de Autenticación
```javascript
// En la consola del navegador
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### Ver Todas las Peticiones de Red
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Filtra por "XHR" o "Fetch"
4. Intenta hacer login
5. Haz clic en la petición `/api/users/login`
6. Ve a la pestaña "Response" para ver qué devolvió el backend

### Ver Logs del Backend
```bash
# En la terminal donde corre el backend
# Deberías ver logs como:
# POST "/api/users/login"
# Usuario encontrado: admin@test.com
# Login exitoso
```

---

## 🧹 Limpieza Completa

Si nada funciona, intenta una limpieza completa:

### Frontend
```bash
# 1. Limpiar caché de npm
rm -rf node_modules
rm package-lock.json
npm install

# 2. Limpiar caché de Vite
rm -rf .vite
rm -rf dist

# 3. Reiniciar servidor
npm run dev
```

### Backend
```bash
# 1. Limpiar y recompilar
./mvnw clean install

# 2. Reiniciar servidor
./mvnw spring-boot:run
```

### Navegador
```javascript
// 1. Limpiar localStorage
localStorage.clear();

// 2. Limpiar cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// 3. Hacer hard refresh
// Windows/Linux: Ctrl + Shift + R
// Mac: Cmd + Shift + R
```

---

## 📞 Checklist de Depuración

Cuando algo no funcione, verifica en este orden:

- [ ] ¿El backend está corriendo? (`http://localhost:8090`)
- [ ] ¿CORS está configurado?
- [ ] ¿El usuario existe en la base de datos?
- [ ] ¿La contraseña está encriptada con BCrypt?
- [ ] ¿El localStorage está limpio? (no tiene `'undefined'`)
- [ ] ¿El frontend está enviando `correo` (no `email`)?
- [ ] ¿El backend devuelve tanto `token` como `user`?
- [ ] ¿Los nombres de campos coinciden? (`user_id`, `name`, `correo`, etc.)
- [ ] ¿Hay errores en la consola del navegador?
- [ ] ¿Hay errores en los logs del backend?

---

## 🆘 Obtener Ayuda

Si sigues teniendo problemas:

1. **Captura los logs completos:**
   - Consola del navegador (F12)
   - Logs del backend
   - Respuesta de la petición de login

2. **Verifica la base de datos:**
   ```sql
   SELECT user_id, name, correo, rol_id, activo FROM "user";
   ```

3. **Comparte:**
   - Los logs
   - El código de `LoginResponse` del backend
   - El código de `LoginService` del backend

