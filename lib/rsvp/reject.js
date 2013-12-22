import Promise from "./promise";

export default function reject(reason, label) {
  return Promise.reject(reason, label);
};
