import Promise from "./promise";

export default function all(array, label) {
  return Promise.all(array, label);
};
