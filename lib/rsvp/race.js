import Promise from "./promise";

/**
  @method race
  @namespace RSVP
  @static
*/
export default function race(array, label) {
  return Promise.race(array, label);
};
