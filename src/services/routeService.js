import {
  ROAD_LINE_STYLE,
  AIR_LINE_STYLE,
} from '@/constants/map';

export const RouteService = (ymaps) => ({
  async buildRoadRoute(start, end) {
    return await ymaps.route([start, end], {
      mapStateAutoApply: false,
      avoidTrafficJams: false,
    });
  },

  async drawRoadRoute(map, start, end) {
    const route = await ymaps.route([start, end], {
      avoidTrafficJams: false,
    });

    route.getPaths().each((path) => {
      path.options.set(ROAD_LINE_STYLE);
    });

    map.geoObjects.add(route);

    return route;
  },

  drawAirRoute(map, start, end) {
    const line = new ymaps.Polyline([start, end], {}, AIR_LINE_STYLE);
    map.geoObjects.add(line);
    return line;
  },

  calculateAirDistance(a, b) {
    return ymaps.coordSystem.geo.getDistance(a, b) / 1000;
  },

  async calculateRoadDistance(a, b) {
    const route = await ymaps.route([a, b]);
    return route.getLength() / 1000;
  },
});
