import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import { saveLSData, getLSData, removeLSData } from '@/utils/localStorageUtils';

export const useMapStore = defineStore('map', {
  state: () => ({
    airRoute: null,
    roadRoute: null,
    airDistance: 0,
    roadDistance: 0,
    startPoint: null,
    routes: [],
  }),
  actions: {
    saveRoute(from, to, type, name, isActive = true) {
      this.routes.push({
        name,
        type,
        startPoint: from,
        endPoint: to,
        isActive,
      });

      this.updateLSRoutes();
    },

    updateLSRoutes() {
      const routes = this.routes.map((route) => {
        const obj = {
          name: route.name,
          type: route.type,
          startPoint: route.startPoint,
          endPoint: route.endPoint,
          isActive: route.isActive,
        };

        return obj;
      });

      saveLSData('routes', routes.slice(-6));
    },

    updateRoutesFromLS() {
      const data = getLSData('routes');
      if (data) {
        this.routes = data;
      }
    },
    // clearRoutes(map) {
    //   if (!this.airRoute || !this.roadRoute) return;

    //   [toRaw(this.airRoute), toRaw(this.roadRoute)].forEach((route) => {
    //     if (route) map.geoObjects.remove(route);
    //   });
    //   this.airRoute = null;
    //   this.roadRoute = null;
    // },
    clearRoutes(map) {
      this.routes = this.routes.map((route) => {
        if (route.isActive) {
          map.geoObjects.remove(toRaw(route.instance));
          route.isActive = false;
        }
        return route;
      });
    },
    updateDistances(air, road) {
      this.airDistance = air.toFixed(1);
      this.roadDistance = road.toFixed(1);
    },
  },
});
