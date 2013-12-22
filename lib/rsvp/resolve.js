import Promise from "./promise";

export default function resolve(value, label) {
  return Promise.resolve(value, label);
};
