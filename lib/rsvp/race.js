import Promise from "./promise";

export default function race(array) {
  return Promise.race(array);
};
