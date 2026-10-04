export function greeting(method,pathname){
  // TODO: recognise only GET /api/greetings/<one encoded name segment>.
  // Decode then trim; blank or invalid percent encoding =>400 name_required.
  // Extra literal path segments/unknown paths=>404 not_found.
  // A matched path with another method=>405 method_not_allowed.
  // Success=>200 {message:'Hello, <name>!',source:'path'}.
  void method;void pathname;return {status:404,body:{error:'not_found'}};
}
