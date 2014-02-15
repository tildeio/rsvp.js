let var = macro {
  rule { $args = a_slice($arguments)} => {
    var length = $arguments.length;
    var $args = new Array(length);
    for (var i = 0; i < length; i++ ){
      $args[i] = arguments[i];
    }
  }

  rule { } => { var }
}

export var;
