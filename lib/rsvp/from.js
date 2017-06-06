import hash from './hash';
import all from './all';

/**
  `RSVP.from` wraps the argument passed in a promise.

  It can also optionally receive a label as a second argument.

  @method from
  @static
  @for RSVP
  @param {Array,Object}
  @param {String} label An optional label. This is useful
  for tooling.
*/
export default function from(object, label) {
  if (Array.isArray(object)) {
    return all(object, label);
  } else if (typeof object == 'object') {
    return hash(object, label);
  } else {
    return Promise.resolve(object, label);
  }
}
