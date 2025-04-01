<script setup>
import { ref, onMounted, toRaw } from 'vue';
import { useMapStore } from '@/stores/mapStore';
import {
  MKAD_COORDS, AROUND_MKAD_COORDS, MAP_CENTER, MAP_ZOOM, POLYGON_STYLE, ROAD_TYPES, POLIGON_TYPES,
} from '@/constants/map';
import { findNearestPolygonPoint, findRoadIntersection, loadYmapScript } from '@/utils/mapUtils';
import { RouteService } from '@/services/routeService';

const mapStore = useMapStore();
const mapContainer = ref(null);
const isScriptLoaded = ref(false);
const loadError = ref(null);

let map = null;
let maps = null;

// Инициализация карты
const initMap = (loading) => {
  isScriptLoaded.value = loading.isLoaded;
  if (!loading.isLoaded) {
    loadError.value = loading.error;
    return;
  }

  window.ymaps.ready(() => {
    try {
      map = new window.ymaps.Map(mapContainer.value, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
      });

      maps = window.ymaps;

      // Добавляем полигон Ближнего подмосковья
      const aroundMkadPolygon = new window.ymaps.Polygon(AROUND_MKAD_COORDS, {
        hintContent: 'Ближнее подмосковье',
      }, POLYGON_STYLE);
      map.geoObjects.add(aroundMkadPolygon);

      // Добавляем полигон МКАД
      const mkadPolygon = new window.ymaps.Polygon(MKAD_COORDS, {
        hintContent: 'Московская кольцевая автодорога',
      }, POLYGON_STYLE);
      map.geoObjects.add(mkadPolygon);

      if (mapStore.routes.length) {
        drawRoutes();
      }

      // Регистрируем обработчик кликов
      map.events.add('click', handleMapClick);
    } catch (error) {
      loadError.value = 'Ошибка при инициализации карты';
    }
  });
};

// Обработчик клика по карте
const handleMapClick = async (e) => {
  try {
    const routeService = RouteService(maps);

    const startPoint = e.get('coords');

    // Отчищение маршрутов с карты и отметка их неактивными
    mapStore.clearRoutes(map);

    // Построение маршрутов до МКАДа
    const endPointAirMKAD = findNearestPolygonPoint(maps, startPoint, MKAD_COORDS);
    const routeMKAD = await routeService.buildRoadRoute(startPoint, endPointAirMKAD);
    const intersectionMKAD = findRoadIntersection(routeMKAD, MKAD_COORDS);

    // Сохранение данных в store и localStorage
    mapStore.saveRoute(startPoint, endPointAirMKAD, ROAD_TYPES.LINE, POLIGON_TYPES.MKAD);
    mapStore.saveRoute(startPoint, intersectionMKAD || endPointAirMKAD, ROAD_TYPES.ROAD, POLIGON_TYPES.MKAD);

    // Построение маршрутов до ближнего подмосковья
    const endPointAirAMKAD = findNearestPolygonPoint(maps, startPoint, AROUND_MKAD_COORDS);
    const routeAMKAD = await routeService.buildRoadRoute(startPoint, endPointAirAMKAD);
    const intersectionAMKAD = findRoadIntersection(routeAMKAD, AROUND_MKAD_COORDS);

    // Сохранение данных в store и localStorage
    mapStore.saveRoute(startPoint, endPointAirAMKAD, ROAD_TYPES.LINE, POLIGON_TYPES.AROUND_MKAD);
    mapStore.saveRoute(startPoint, intersectionAMKAD || endPointAirAMKAD, ROAD_TYPES.ROAD, POLIGON_TYPES.AROUND_MKAD);

    drawRoutes();
    calculateDistances();
  } catch (error) {
    console.error('Ошибка построения маршрута:', error);
  }
};

const calculateDistances = async () => {
  console.clear();
  const routeService = RouteService(maps);

  mapStore.routes.forEach(async (route) => {
    if (!route.isActive) return;

    if (route.type === ROAD_TYPES.LINE) {
      const airDist = routeService.calculateAirDistance(toRaw(route.startPoint), toRaw(route.endPoint));
      console.log(`Расстояние по воздуху до ${route.name === POLIGON_TYPES.MKAD
        ? 'МКАДа:'
        : 'ближнего подмосковья:'} ${airDist.toFixed(2)} км`);
    } else {
      const roadDist = await routeService.calculateRoadDistance(
        toRaw(route.startPoint),
        toRaw(route.endPoint),
      );
      console.log(`Расстояние по дороге до ${route.name === POLIGON_TYPES.MKAD
        ? 'МКАДа:'
        : 'ближнего подмосковья:'} ${roadDist.toFixed(2)} км`);
    }
  });
};

const drawRoutes = async () => {
  const routeService = RouteService(maps);
  mapStore.routes.forEach(async (route) => {
    if (route.isActive) {
      switch (route.type) {
        case ROAD_TYPES.LINE:
          route.instance = await routeService.drawAirRoute(map, route.startPoint, route.endPoint);
          break;
        case ROAD_TYPES.ROAD:
          route.instance = await routeService.drawRoadRoute(map, route.startPoint, route.endPoint);
          break;
        default:
          console.error(`Unknown route name ${route.name}`);
          break;
      }
    }
  });
};

// Инициализация при монтировании
onMounted(() => {
  loadYmapScript(initMap);
  mapStore.updateRoutesFromLS();
});
</script>

<template>
  <div
    ref="mapContainer"
    style="width: 100%; height: 100%"
  >
    <div
      v-if="loadError"
      class="error"
    >
      {{ loadError }}
    </div>
    <div
      v-else-if="!isScriptLoaded"
      class="loading"
    >
      Загрузка карты...
    </div>
  </div>
</template>

<style scoped>
.error,
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
