import Promise from "./promise";

/**
  This is a convenient alias for `RSVP.Promise.race`.

  @method race
  @param {Array} array Array of promises.
  @param {String} label An optional label. This is useful
  for tooling.
  @static
*/
export default function race(array, label) {
  return Promise.race(array, label);
};
