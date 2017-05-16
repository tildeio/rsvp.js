import Promise from './promise';
import {
  isFunction
} from './utils';

function _reduce(total, values, fn, index, label) {
  return Promise.resolve(total, label)
    .then(function(total) {
      if (index < values.length) {
        return _reduce(
          fn(total, values[index]),
          values,
          fn,
          index + 1,
          label
        );
      } else {
        return total;
      }
    });
}

export default function reduce(promises, fn, total, label) {
  return Promise.all(promises, label)
    .then(values => {
      if (!isFunction(fn)) {
        throw new TypeError("You must pass a function as reduce's second argument.");
      }
      return _reduce(total || 0, values, fn, 0, label);
    });
}
