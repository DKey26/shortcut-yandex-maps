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
    const next = polygonCoords[j];s
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
