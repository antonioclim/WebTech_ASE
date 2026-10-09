export function isRetryable({kind,status}){
 // TODO: kind transport=>true; kind parse=>false; kind http=>status>=500.
 // Unknown kind throws TypeError; HTTP status must be integer100..599.
 void kind;void status;return false;
}
