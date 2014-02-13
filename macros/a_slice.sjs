macro $a_slice {
  rule { ($args, $arguments); } => {
    var length = $arguments.length;
    $args = new Array(length);
    for ( var i = 0; i < length; i++) {
      $args[i] = arguments[i];
    };
  }
}

export $a_slice;
