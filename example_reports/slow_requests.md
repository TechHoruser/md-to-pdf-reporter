---
title: Informe de solicitudes lentas de serviceX - OrgX
author: AuthorX
company: CompanyX
date: 2026-03-25
version: 1.0
---

# Contexto

El monitoreo reciente en el entorno de producción de OrgX ha detectado un problema de rendimiento en ciertas solicitudes de la API. Concretamente, varias peticiones están superando los umbrales de timeout estándar, y algunas tardan hasta **12.5 segundos** en completarse. Estas demoras están provocando la activación de políticas internas de resiliencia y afectan la experiencia de usuario.

# Análisis del incidente

El análisis de los informes de Kibana del **2026-03-25** muestra que, aunque la latencia media se sitúa alrededor de 871 ms, la latencia en la cola (tail) es extremadamente alta, lo que indica que operaciones concretas están seriamente afectadas por cuellos de botella.

## Métricas de rendimiento

| Métrica | Valor |
| :--- | :--- |
| **Trace IDs analizados** | 1108 |
| **Latencia media** | 871.22 ms |
| **p50 (Mediana)** | 124.50 ms |
| **p90** | 711.80 ms |
| **p95** | 4160.00 ms |
| **p99** | 11074.00 ms |

## Activación de políticas

Los informes muestran que la política `functionA` se activó **3 veces** por timeouts. Esta política gestiona las solicitudes de contenido de filas mediante URLs específicas, y su fallo se correlaciona directamente con los picos de 12s+ observados.

## Resumen de las peticiones más lentas

Las peticiones más lentas apuntan de forma recurrente a filas de navegación para páginas concretas (por ejemplo, `MEN56472`). Estas peticiones parecen recuperar grandes volúmenes de contenido premium o configuraciones de fila complejas que serviceX (SX) está sirviendo en plazos.

# Evidencia y análisis de trazas

A continuación se muestran las trazas detalladas de las peticiones más afectadas:

## Traza: timeout de 12.5 s y reintentos
En esta traza se observa cómo la política `functionA` registra un **TIMEOUT** dos veces, tras intervalos de 5 segundos, antes de que la petición finalice después de 12.5 segundos.

-```log
====================================================================================================
TRACE_ID: 1e10be9a6dc32374a81571eb2a64c0a5 | EVENTS: 14 | START: 2026-03-25T09:00:48.298+00:00 | END: 2026-03-25T09:01:00.829+00:00
====================================================================================================
[09:00:48.298] [INFO] [app1] ---> App1 IN -> [GET] /api/app1-api/v1/operators/OrgX_bossID/products/PREMIUM_L_MAX/users/1686267/navigation/catalogs/new_companyx_orgx_finland_full/languages/en-gb/device-types/Web/profiles/default/pages/MEN56472/rows/UNK1267?page=0&size=24&ageRating=AGE_X
[09:00:53.302] [INFO] [app1] [POLICY] [functionA] Code: TIMEOUT Status: Unknown IsTaskCancelledError: true
[09:00:58.340] [INFO] [app1] [POLICY] [functionA] Code: TIMEOUT Status: Unknown IsTaskCancelledError: true
...
[09:01:00.826] [INFO] [app1] serviceX -> [GET] /v1/catalogs/.../vodLive?contentTypes=... 200 2.4s
[09:01:00.829] [INFO] [app1] <--- App1 OUT -> [GET] .../rows/UNK1267 200 12.5s
-```

## Traza: timeout de 7.9 s
Otro ejemplo muestra un patrón similar con una única activación de timeout en la política, resultando en un tiempo total de respuesta de ~8 segundos.

-```log
====================================================================================================
TRACE_ID: ab73a4820743d39c376ee1d7c1915ecd | EVENTS: 12 | START: 2026-03-25T09:01:09.251+00:00 | END: 2026-03-25T09:01:17.191+00:00
====================================================================================================
[09:01:09.251] [INFO] [app1] ---> App1 IN -> [GET] .../pages/MEN56472/rows/UNK1268?page=0&size=24&ageRating=AGE_X
[09:01:14.255] [INFO] [app1] [POLICY] [functionA] Code: TIMEOUT Status: Unknown IsTaskCancelledError: true
...
[09:01:17.188] [INFO] [app1] serviceX -> [GET] /v1/catalogs/.../vodLive?contentTypes=... 200 2.8s
[09:01:17.191] [INFO] [app1] <--- App1 OUT -> [GET] .../rows/UNK1268 200 7.9s
-```

# Discusión de la causa raíz

El problema subyacente parece deberse a los tiempos de respuesta de **serviceX (SX)** en el endpoint `vodLive` cuando se aplica a filas de alta densidad (`UNK1267`, `UNK1268`).

- **Intervención de la política:** La política `functionA` entra en estado de timeout cuando el servicio downstream (SX) no responde en 5 segundos. El tiempo acumulado (incluyendo reintentos o finalizaciones lentas) conduce a la duración total de 12s+.
- **Complejidad de la consulta:** Las consultas implicadas usan filtros extensos (`genresFilter`, `includeOnlyChannels` con más de 100 PIDs), lo que probablemente incrementa el tiempo de procesamiento en SX o en la capa de SY.

# Reporte de serviceX

> serviceX necesita tener muchos datos para crear algunas de sus respuestas. En un escenario de uso normal, esos datos son cacheados rápidamente luego de una actualización de catálogo, ya que los datos son compartidos entre los usuarios. En un escenario de poco o casi ningún uso, como el de OrgX, los datos no quedan cacheados. Esto hace que, cuando un usuario intenta usar el servicio, algunos tiempos de respuesta tarden mientras esos datos no están cacheados, ya que son hechas muchas llamadas pesadas contra otros servicios.
>
> Puntos de acción:
>
> - De mi lado, miraré a ver si puedo mejorar la eficiencia de la caché. Esto requiere tiempo de analisis, desarrollo, pruebas y despliegue;
> - Como alternativa inmediata, lo que se puede hacer es crear un listado de llamadas hechas por App1, y que un cron las ejecute cada x minutos. Esto hará que la caché quede rellena, mejorando los tiempos de respuesta
