import Promise from "./promise";

/**
  This is a convenient alias for `RSVP.Promise.all`.

  @method all
  @param {Array} array Array of promises.
  @param {String} label An optional label. This is useful
  for tooling.
  @static
*/
export default function all(array, label) {
  return Promise.all(array, label);
};
