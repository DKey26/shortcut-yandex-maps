import { defineStore } from 'pinia';
import { toRaw } from 'vue';

export const useMapStore = defineStore('map', {
  state: () => ({
    airRoute: null,
    roadRoute: null,
    airDistance: 0,
    roadDistance: 0,
    startPoint: null,
  }),
  actions: {
    clearRoutes(map) {
      if (!this.airRoute || !this.roadRoute) return;

      [toRaw(this.airRoute), toRaw(this.roadRoute)].forEach((route) => {
        if (route) map.geoObjects.remove(route);
      });
      this.airRoute = null;
      this.roadRoute = null;
    },
    updateDistances(air, road) {
      this.airDistance = air.toFixed(1);
      this.roadDistance = road.toFixed(1);
    },
  },
});
