export const RouteService = (ymaps) => ({
  async buildRoadRoute(start, end) {
    return await ymaps.route([start, end], {
      mapStateAutoApply: false,
      avoidTrafficJams: false,
    });
  },

  async drawRoadRoute(start, end) {
    const route = await ymaps.route([start, end], {
      mapStateAutoApply: true,
      avoidTrafficJams: false,
    });
    return route;
  },

  calculateAirDistance(a, b) {
    return ymaps.coordSystem.geo.getDistance(a, b) / 1000;
  },

  async calculateRoadDistance(a, b) {
    const route = await ymaps.route([a, b]);
    return route.getLength() / 1000;
  },
});
