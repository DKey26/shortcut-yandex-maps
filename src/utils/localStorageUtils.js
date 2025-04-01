export const saveLSData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLSData = (key) => {
  const data = localStorage.getItem(key);
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

export const removeLSData = (key) => {
  localStorage.removeItem(key);
};
