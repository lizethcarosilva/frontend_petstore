# 🔍 DEBUG: Token NO se valida - Error 403 Persiste

## 🎯 Problema Actual

- ✅ Login funciona (200 OK)
- ✅ Token se genera correctamente
- ✅ Frontend envía el token en el header `Authorization: Bearer {token}`
- ❌ Backend devuelve **403 Forbidden** en todos los endpoints protegidos

Esto significa que **el token NO se está validando correctamente** o **la autenticación NO se está estableciendo** en el contexto de Spring Security.

---

## 🔍 PASO 1: Verificar que el Token se Está Enviando

### En el Frontend (Navegador):

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Haz una petición (ejemplo: ir a `/users`)
4. Click en la petición
5. Ve a **Headers** → **Request Headers**
6. **Busca**: `Authorization: Bearer eyJhbGci...`

### ✅ Si ves el header Authorization:
El frontend está correcto, el problema está en el backend.

### ❌ Si NO ves el header Authorization:
El problema está en el frontend (el token no se está guardando o no se está enviando).

---

## 🔍 PASO 2: Verificar Logs del Backend

### Agregar logs DEBUG en `application.properties`:

```properties
# Habilitar logs DEBUG para seguridad y JWT
logging.level.com.cipasuno.petstore.pet_store.config=DEBUG
logging.level.com.cipasuno.petstore.pet_store.security=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Reiniciar Backend y Ver Logs:

Cuando hagas una petición a `/api/users`, deberías ver:

```
DEBUG JwtAuthenticationFilter : Procesando request: GET /api/users
DEBUG JwtAuthenticationFilter : Token extraído: eyJhbGci...
DEBUG JwtUtil : Validando token...
DEBUG JwtUtil : Token válido
DEBUG JwtUtil : Email extraído: user@example.com
DEBUG CustomUserDetailsService : Buscando usuario: user@example.com
DEBUG CustomUserDetailsService : Usuario encontrado: user@example.com
DEBUG JwtAuthenticationFilter : Usuario autenticado correctamente
```

### Si ves estos logs:
El JWT está funcionando, pero hay un problema en el `SecurityConfig`.

### Si NO ves estos logs:
El filtro JWT NO se está ejecutando correctamente.

---

## 🔧 SOLUCIÓN 1: Verificar SecurityConfig

### El problema más común: El filtro NO está registrado correctamente

**Archivo**: `SecurityConfig.java`

Verifica que tengas:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // ⚠️ IMPORTANTE: Orden correcto
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers("/api/users/create").permitAll()
                
                // Todos los demás endpoints requieren autenticación
                .anyRequest().authenticated()
            )
            // ⚠️ CRÍTICO: Agregar el filtro JWT ANTES del filtro de autenticación
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    // ... resto del código
}
```

### 🔑 Claves Importantes:

1. ✅ `jwtAuthenticationFilter` debe estar inyectado con `@Autowired`
2. ✅ Debe agregarse **ANTES** de `UsernamePasswordAuthenticationFilter`
3. ✅ Los endpoints públicos deben estar **ANTES** de `.anyRequest().authenticated()`

---

## 🔧 SOLUCIÓN 2: Verificar JwtAuthenticationFilter

### El filtro debe establecer la autenticación en el contexto

**Archivo**: `JwtAuthenticationFilter.java`

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        logger.debug("Procesando request: {} {}", request.getMethod(), request.getRequestURI());
        
        try {
            String jwt = extractTokenFromRequest(request);
            
            if (jwt != null) {
                logger.debug("Token extraído: {}...", jwt.substring(0, Math.min(20, jwt.length())));
                
                if (jwtUtil.validateToken(jwt)) {
                    logger.debug("Token válido");
                    
                    String email = jwtUtil.getEmailFromToken(jwt);
                    logger.debug("Email extraído: {}", email);
                    
                    if (email != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        
                        authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        
                        // ⚠️ CRÍTICO: Establecer autenticación en el contexto
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        logger.debug("Usuario autenticado correctamente: {}", email);
                        logger.debug("Authorities: {}", userDetails.getAuthorities());
                    }
                } else {
                    logger.warn("Token inválido o expirado");
                }
            } else {
                logger.debug("No se encontró token en la petición");
            }
        } catch (Exception e) {
            logger.error("Error al procesar el token JWT: {}", 
                e.getMessage() != null ? e.getMessage() : e.getClass().getName(), e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        logger.debug("shouldNotFilter - Path: {}, Method: {}", path, method);
        
        // Ignorar requests OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            logger.debug("Ignorando request OPTIONS");
            return true;
        }
        
        // Ignorar endpoints públicos
        boolean shouldNotFilter = path.startsWith("/api/users/login") || 
                                 path.startsWith("/api/users/create");
        
        if (shouldNotFilter) {
            logger.debug("Endpoint público, no requiere autenticación");
        }
        
        return shouldNotFilter;
    }
}
```

---

## 🔧 SOLUCIÓN 3: Verificar CustomUserDetailsService

### Debe cargar el usuario correctamente

**Archivo**: `CustomUserDetailsService.java`

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        logger.debug("Cargando usuario con correo: {}", correo);
        
        User user = userRepository.findByCorreoAndActivoTrue(correo)
                .orElseThrow(() -> {
                    logger.error("Usuario no encontrado o inactivo: {}", correo);
                    return new UsernameNotFoundException("Usuario no encontrado: " + correo);
                });

        logger.debug("Usuario encontrado - ID: {}, Nombre: {}, Rol: {}", 
            user.getUserId(), user.getName(), user.getRolId());

        // ⚠️ IMPORTANTE: El password debe estar hasheado en la BD
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getCorreo())
                .password(user.getPassword()) // Debe empezar con {bcrypt}... o estar hasheado
                .authorities("ROLE_" + user.getRolId())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isActivo())
                .build();
        
        logger.debug("UserDetails creado - Authorities: {}", userDetails.getAuthorities());
        
        return userDetails;
    }
}
```

---

## 🔧 SOLUCIÓN 4: Verificar JwtUtil

### Debe validar y extraer correctamente el token

**Archivo**: `JwtUtil.java`

```java
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String correo, Long userId, String rolId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String token = Jwts.builder()
                .setSubject(correo)
                .claim("userId", userId)
                .claim("rolId", rolId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        logger.debug("Token generado para usuario: {}, expira: {}", correo, expiryDate);
        return token;
    }

    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String email = claims.getSubject();
            logger.debug("Email extraído del token: {}", email);
            
            return email;
        } catch (Exception e) {
            logger.error("Error al extraer email del token: ", e);
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            
            logger.debug("Token validado correctamente");
            return true;
        } catch (SignatureException e) {
            logger.error("Firma JWT inválida: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Token JWT mal formado: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Claims del JWT vacío: {}", e.getMessage());
        }
        return false;
    }
}
```

---

## 🔧 SOLUCIÓN 5: Verificar application.properties

```properties
# JWT Configuration
jwt.secret=TuClaveSecretaSuperSeguraDeAlMenos256BitsParaHS256AlgorithmDeJWT2024PetStore123456
jwt.expiration=86400000

# CORS
cors.allowed.origins=http://localhost:5173,http://localhost:3000

# Logging DEBUG
logging.level.com.cipasuno.petstore.pet_store.config=DEBUG
logging.level.com.cipasuno.petstore.pet_store.security=DEBUG
logging.level.org.springframework.security=DEBUG

# Database (ejemplo)
spring.datasource.url=jdbc:postgresql://localhost:5432/petstore
spring.datasource.username=postgres
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

⚠️ **IMPORTANTE**: `jwt.secret` debe tener **al menos 256 bits (32 caracteres)** para HS256.

---

## 🧪 PRUEBA RÁPIDA: ¿Funciona el Token?

### Test Manual con curl:

```bash
# 1. Hacer login y guardar el token
curl -X POST http://localhost:8090/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@vetsanfrancisco.com","password":"admin123"}' \
  > response.json

# 2. Extraer el token del response.json
# Copia el valor del campo "token"

# 3. Usar el token en una petición protegida
curl -X GET http://localhost:8090/api/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -v
```

### ¿Qué debe pasar?

**Si funciona** (200 OK):
- El problema está en el frontend (no está enviando el token correctamente)

**Si NO funciona** (403 Forbidden):
- El problema está en el backend (el filtro JWT no está funcionando)

---

## 🆘 Checklist de Problemas Comunes

### ❌ Problema: `jwtUtil` es null
**Causa**: No está inyectado correctamente
**Solución**: Verificar que `@Autowired` esté presente y que `JwtUtil` tenga `@Component`

### ❌ Problema: `userDetailsService` es null
**Causa**: No está inyectado correctamente
**Solución**: Verificar que `CustomUserDetailsService` tenga `@Service`

### ❌ Problema: Token válido pero sigue 403
**Causa**: La autenticación NO se está estableciendo en `SecurityContextHolder`
**Solución**: Verificar que `SecurityContextHolder.getContext().setAuthentication(authentication)` se ejecute

### ❌ Problema: "Usuario no encontrado"
**Causa**: El email del token no existe en la BD
**Solución**: Verificar que el usuario exista y esté activo

### ❌ Problema: "Firma JWT inválida"
**Causa**: La clave secreta es diferente entre generación y validación
**Solución**: Usar la MISMA `jwt.secret` en `application.properties`

### ❌ Problema: "Token JWT expirado"
**Causa**: El token ha caducado
**Solución**: Hacer login de nuevo para obtener un nuevo token

---

## 🚀 PASOS A SEGUIR AHORA

1. **Agregar logs DEBUG** en `application.properties`
2. **Reiniciar el backend**
3. **Hacer login** desde el frontend
4. **Intentar acceder a `/users`**
5. **Ver los logs del backend** - ¿Qué dice?
6. **Copiar los logs aquí** para ayudarte a diagnosticar

---

## 📋 Logs que Necesito Ver

Cuando hagas una petición a `/api/users`, copia y pega TODOS los logs que aparezcan, especialmente:

- Logs de `JwtAuthenticationFilter`
- Logs de `JwtUtil`
- Logs de `CustomUserDetailsService`
- Logs de `Spring Security`
- **Cualquier ERROR o WARN**

Con esos logs podré decirte exactamente qué está fallando.

---

**Estado**: 🔍 DEBUGGING  
**Acción**: ⏳ AGREGAR LOGS Y REINICIAR BACKEND  
**Tiempo**: 2 minutos  

# 🔍 AGREGA LOS LOGS DEBUG Y COMPARTE LOS RESULTADOS

