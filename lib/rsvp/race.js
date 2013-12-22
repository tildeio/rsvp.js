import Promise from "./promise";

export default function race(array, label) {
  return Promise.race(array, label);
};
