---
title: Prueba de Informe
author: AuthorX
company: CompanyX
date: 2026-03-24
version: 1.0
---

# Sección 1

En esta descripción quiero incluir [este enlace](https://companyx.com).

## Subsección 1.1

Este es un ejemplo de imagen:

![example](assets/image.png)

-```bash
curl 'https://orgx.cdn.companyx.com/api/app1-api/v1/operators/OrgX_bossID/products/PREMIUM_L_MAX/catalogs/new_companyx_orgx_finland_full/languages/en-gb/live?channelPids=LCH90434%2CLCH90435%2CLCH90536&start=2026-03-21T23%3A00%3A00.000Z&end=2026-03-22T22%3A59%3A59.999Z'
-```

## Subsección con tabla

| Encabezado 1 | Encabezado 2 | Encabezado 3 |
|---|---|---|
|Prueba 1|Prueba 2|Prueba 3|
|Prueba 4|Prueba 5|Prueba 6|

# Sección 2

## Subsección 2.1

Subsección con una lista de viñetas:

* Prueba 1
* Prueba 2
* Prueba 3

# Ejemplos de Chart.js

A continuación se muestran ejemplos de cada tipo de gráfico soportado por Chart.js:

## 1. Gráfico de Barras
-```chart-bar
{
  "labels": ["January", "February", "March", "April"],
  "datasets": [{
    "label": "Sales 2023",
    "data": [10, 20, 30, 40],
    "backgroundColor": "rgba(54, 162, 235, 0.6)",
    "borderColor": "rgba(54, 162, 235, 1)",
    "borderWidth": 1
  }]
}
-```

/new-page

## 2. Gráfico de Líneas
-```chart-line
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "datasets": [{
    "label": "Active Users",
    "data": [150, 200, 180, 220, 260],
    "fill": false,
    "borderColor": "rgba(75, 192, 192, 1)",
    "tension": 0.1
  }]
}
-```

## 3. Gráfico de Tarta
-```chart-pie
{
  "labels": ["Desktop", "Mobile", "Tablet"],
  "datasets": [{
    "data": [300, 500, 100],
    "backgroundColor": [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)"
    ]
  }]
}
-```

/new-page

## 4. Gráfico de Rosca
-```chart-doughnut
{
  "labels": ["Red", "Green", "Yellow"],
  "datasets": [{
    "data": [10, 20, 30],
    "backgroundColor": ["#ff6384", "#36a2eb", "#ffce56"]
  }]
}
-```

## 5. Gráfico de Radar
-```chart-radar
{
  "labels": ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
  "datasets": [{
    "label": "My First Dataset",
    "data": [65, 59, 90, 81, 56, 55, 40],
    "fill": true,
    "backgroundColor": "rgba(255, 99, 132, 0.2)",
    "borderColor": "rgb(255, 99, 132)",
    "pointBackgroundColor": "rgb(255, 99, 132)",
    "pointBorderColor": "#fff",
    "pointHoverBackgroundColor": "#fff",
    "pointHoverBorderColor": "rgb(255, 99, 132)"
  }]
}
-```

/new-page

## 6. Gráfico de Área Polar
-```chart-polarArea
{
  "labels": ["Red", "Green", "Yellow", "Grey", "Blue"],
  "datasets": [{
    "label": "My First Dataset",
    "data": [11, 16, 7, 3, 14],
    "backgroundColor": [
      "rgb(255, 99, 132)",
      "rgb(75, 192, 192)",
      "rgb(255, 205, 86)",
      "rgb(201, 203, 207)",
      "rgb(54, 162, 235)"
    ]
  }]
}
-```

## 7. Gráfico de Burbujas
-```chart-bubble
{
  "datasets": [{
    "label": "First Dataset",
    "data": [{
      "x": 20,
      "y": 30,
      "r": 15
    }, {
      "x": 40,
      "y": 10,
      "r": 10
    }],
    "backgroundColor": "rgb(255, 99, 132)"
  }]
}
-```

/new-page

## 8. Gráfico de Dispersión
-```chart-scatter
{
  "datasets": [{
    "label": "Scatter Dataset",
    "data": [{
      "x": -10,
      "y": 0
    }, {
      "x": 0,
      "y": 10
    }, {
      "x": 10,
      "y": 5
    }, {
      "x": 0.5,
      "y": 5.5
    }],
    "backgroundColor": "rgb(255, 99, 132)"
  }]
}
-```

## 9. Combinado: 2 Gráficos de Barras
-```chart-bar
{
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "datasets": [
    {
      "label": "Revenue 2022",
      "data": [50, 60, 70, 180],
      "backgroundColor": "rgba(255, 99, 132, 0.6)"
    },
    {
      "label": "Revenue 2023",
      "data": [80, 90, 100, 200],
      "backgroundColor": "rgba(54, 162, 235, 0.6)"
    }
  ]
}
-```

/new-page

## 10. Combinado: Barras y Líneas
Para combinar estilos, es importante definir el tipo base (ej. `chart-bar`) y luego especificar `"type": "line"` y `"type": "bar"` dentro de cada dataset respectivo:

-```chart-bar
{
  "labels": ["January", "February", "March", "April"],
  "datasets": [
    {
      "type": "line",
      "label": "Target",
      "data": [50, 50, 50, 50],
      "borderColor": "rgb(255, 99, 132)",
      "borderWidth": 2,
      "fill": false
    },
    {
      "type": "bar",
      "label": "Actual Sales",
      "data": [10, 20, 60, 40],
      "backgroundColor": "rgba(75, 192, 192, 0.6)",
      "borderColor": "rgb(75, 192, 192)",
      "borderWidth": 1
    }
  ]
}
-```

# Ejemplo de flujos

-```mermaid
%%{init: { 'theme': 'base', 'themeVariables': { 'git0': '#E53935', 'git1': '#FB8C00', 'git2': '#00ACC1', 'git3': '#1E88E5', 'git4': '#43A047', 'git5': '#FDD835', 'git6': '#8E24AA' }, 'gitGraph': { 'rotateCommitLabel': true, 'mainBranchName': 'main' } } }%%
gitGraph
    commit id: "init" tag: "v1.0.0"
    
    branch develop order: 3
    checkout develop
    commit id: "setup inicial"

    branch feature/A order: 4
    checkout feature/A
    commit id: "feat: añadir A"

    checkout develop
    branch feature/B order: 5
    checkout feature/B
    commit id: "feat: añadir B"

    checkout develop
    merge feature/A
    merge feature/B

    branch feature/C order: 6
    checkout feature/C
    commit id: "feat: inicio C"

    checkout develop
    branch release/1.1.0 order: 2
    checkout release/1.1.0
    commit id: "chore: bump 1.1.0"

    checkout main
    merge release/1.1.0 tag: "v1.1.0"
    checkout develop
    merge release/1.1.0

    checkout main
    branch hot-fix/1.1.1 order: 1
    checkout hot-fix/1.1.1
    commit id: "fix: bug crítico"
    commit id: "chore: bump 1.1.1"

    checkout main
    merge hot-fix/1.1.1 tag: "v1.1.1"
    checkout develop
    merge hot-fix/1.1.1

    checkout feature/C
    commit id: "feat: final C"
    
    checkout develop
    merge feature/C
-```
