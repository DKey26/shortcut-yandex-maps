export const isPointInPolygon = (point, polygonCoords) => {
  const x = point[1]; // longitude (долгота)
  const y = point[0]; // latitude (широта)
  let isInside = false;
  for (
    let i = 0, j = polygonCoords.length - 1;
    i < polygonCoords.length;
    j = i++
  ) {
    const current = polygonCoords[i];
    const next = polygonCoords[j];
    // Текущая вершина (current)
    const xi = current[1]; // longitude
    const yi = current[0]; // latitude

    // Следующая вершина (next)
    const xj = next[1]; // longitude
    const yj = next[0]; // latitude
    // Проверка пересечения луча с ребром многоугольника
    const vertexCross = yj > y !== yi > y;

    // Вычисление X-координаты пересечения
    const slope = (xj - xi) / (yj - yi);
    const intersectionX = xi + (y - yi) * slope;
    // Основное условие пересечения
    const edgeCross = vertexCross && x < intersectionX;
    if (edgeCross) {
      isInside = !isInside;
    }
  }

  return isInside;
};

export const findNearestPolygonPoint = (ymaps, point, polygonCoords) => {
  let minDistance = Infinity;
  let nearestPoint = null;
  polygonCoords.flat(1).forEach((p) => {
    const dist = ymaps.coordSystem.geo.getDistance(point, p);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = p;
    }
  });
  return nearestPoint;
};

export const findRoadIntersection = (route, polygon) => {
  const routePath = route.getPaths().get(0);

  return routePath.geometry._coordPath._coordinates
    .find((point) => isPointInPolygon(point, polygon.flat(1)));
};

export const loadYmapScript = (cb) => {
  if (window.ymaps) {
    cb({
      isLoaded: true,
    });
    return;
  }

  const script = document.createElement('script');
  script.src = `https://api-maps.yandex.ru/2.1/?apikey=${import.meta.env.VITE_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
  script.onload = () => {
    cb({
      isLoaded: true,
    });
  };
  script.onerror = () => {
    cb({
      isLoaded: false,
      error: 'Ошибка загрузки Яндекс Карт',
    });
  };
  document.head.appendChild(script);
};
