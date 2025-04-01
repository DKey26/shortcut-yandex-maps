<template>
  <div>
    <div v-if="isVisible" ref="popup" class="fixed top-4 right-4 w-72" :class="animationClass"
      @animationend="handleAnimationEnd">
      <div class="bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4">
        <div class="flex justify-between items-start justify-start">
          <div class="flex-1 text-left">
            <h3 class="font-semibold text-gray-800">{{ title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ message }}</p>
          </div>
          <button @click="hideNotification" class="text-gray-400 text-lg w-10 h-10 hover:text-gray-600 ml-2 text-xl p-0">
            &times;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';

const props = defineProps({
  duration: {
    type: Number,
    default: 300000,
  },
});

const title = ref('Title');
const message = ref('Message');

const isVisible = ref(false);
const animationClass = ref('');
let timeoutId = null;

const showNotification = (head, text) => {
  title.value = head;
  message.value = text;
  hideNotification();

  isVisible.value = true;
  animationClass.value = 'animate-slide-in-right';

  timeoutId = setTimeout(hideNotification, props.duration);
};

const hideNotification = () => {
  if (!isVisible.value) return;

  animationClass.value = 'animate-slide-out-right';
};

const handleAnimationEnd = (event) => {
  if (event.animationName === 'slide-out-right') {
    isVisible.value = false;
    animationClass.value = '';
  }
};

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId);
});

defineExpose({
  showNotification,
});
</script>

<style>
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-slide-out-right {
  animation: slide-out-right 0.3s ease-in;
}
</style>
