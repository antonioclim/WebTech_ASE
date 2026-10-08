export function suggestProtocol({direction, frequency, latency, replay=false}) {
  const reasons=[];
  if(direction==='server-to-client' && frequency!=='high'){ reasons.push('one-way updates'); return {suggestion:'SSE or polling',reasons,limit:'Validate reconnect, replay and infrastructure separately'}; }
  if(direction==='bidirectional' || frequency==='high' || latency==='interactive'){ reasons.push('interactive bidirectional flow'); return {suggestion:'WebSocket candidate',reasons,limit:'Adds authentication, validation, reconnect, routing and cleanup'}; }
  reasons.push('bounded or infrequent observation'); return {suggestion:'HTTP/polling candidate',reasons,limit:'Choose interval and idempotency deliberately'};
}
