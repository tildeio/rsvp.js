import Promise from "./promise";

/**
  An alias for RSVP.Promise.reject
  @method reject
  @namespace RSVP
  @static
*/
export default function reject(reason, label) {
  return Promise.reject(reason, label);
};
