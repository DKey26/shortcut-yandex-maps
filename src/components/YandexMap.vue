<script setup>
import { ref, onMounted, toRaw } from 'vue';
import { useMapStore } from '@/stores/mapStore';
import {
  MKAD_COORDS, MAP_CENTER, MAP_ZOOM, POLYGON_STYLE,
} from '@/constants/map';
import { isPointInPolygon, findNearestPolygonPoint } from '@/utils/mapUtils';
import { RouteService } from '@/services/routeService';

const mapStore = useMapStore();
const mapContainer = ref(null);
const isScriptLoaded = ref(false);
const loadError = ref(null);

let map = null;
let maps = null;

// Инициализация карты
const initMap = () => {
  window.ymaps.ready(() => {
    try {
      map = new window.ymaps.Map(mapContainer.value, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
      });

      maps = window.ymaps;

      // Добавляем полигон МКАД
      const mkadPolygon = new window.ymaps.Polygon(MKAD_COORDS, {
        hintContent: 'Московская кольцевая автодорога',
      }, POLYGON_STYLE);
      map.geoObjects.add(mkadPolygon);

      // Регистрируем обработчик кликов
      map.events.add('click', handleMapClick);
    } catch (error) {
      loadError.value = 'Ошибка при инициализации карты';
    }
  });
};

// Загрузка API Яндекс.Карт
const loadYmapScript = () => {
  if (window.ymaps) {
    initMap();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://api-maps.yandex.ru/2.1/?apikey=${import.meta.env.VITE_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
  script.onload = () => {
    isScriptLoaded.value = true;
    initMap();
  };
  script.onerror = () => {
    loadError.value = 'Ошибка загрузки Яндекс Карт';
  };
  document.head.appendChild(script);
};

// Обработчик клика по карте
const handleMapClick = async (e) => {
  try {
    const ymaps = maps;
    const routeService = RouteService(ymaps);

    mapStore.startPoint = e.get('coords');
    mapStore.clearRoutes(map);

    // Построение воздушного маршрута
    const endPointAir = findNearestPolygonPoint(ymaps, toRaw(mapStore.startPoint), MKAD_COORDS);
    drawAirRoute(toRaw(mapStore.startPoint), endPointAir);

    // Построение дорожного маршрута
    const route = await routeService.buildRoadRoute(toRaw(mapStore.startPoint), endPointAir);
    const intersection = findRoadIntersection(route);

    if (intersection) {
      await drawRoadRoute(toRaw(mapStore.startPoint), intersection);
    } else {
      await drawRoadRoute(toRaw(mapStore.startPoint), endPointAir);
    }

    // Обновление дистанций
    const airDist = routeService.calculateAirDistance(toRaw(mapStore.startPoint), endPointAir);
    const roadDist = await routeService.calculateRoadDistance(
      toRaw(mapStore.startPoint),
      intersection || endPointAir,
    );

    mapStore.updateDistances(airDist, roadDist);
    console.log(`Расстояние по воздуху: ${airDist.toFixed(2)} км`);
    console.log(`Расстояние по дороге: ${roadDist.toFixed(2)} км`);

  } catch (error) {
    console.error('Ошибка построения маршрута:', error);
  }
};

// Вспомогательные методы
const drawAirRoute = (start, end) => {
  const line = new maps.Polyline([start, end], {
    strokeColor: '#FF0000',
    strokeWidth: 4,
  });
  mapStore.airRoute = line;
  map.geoObjects.add(line);
};

const findRoadIntersection = (route) => {
  const routePath = route.getPaths().get(0);

  return routePath.geometry._coordPath._coordinates
    .find((point) => isPointInPolygon(point, MKAD_COORDS.flat(1)));
};

const drawRoadRoute = async (start, end) => {
  const routeService = RouteService(maps);
  const route = await routeService.drawRoadRoute(start, end);
  mapStore.roadRoute = route;
  map.geoObjects.add(route);
};

// Инициализация при монтировании
onMounted(() => {
  loadYmapScript();
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
