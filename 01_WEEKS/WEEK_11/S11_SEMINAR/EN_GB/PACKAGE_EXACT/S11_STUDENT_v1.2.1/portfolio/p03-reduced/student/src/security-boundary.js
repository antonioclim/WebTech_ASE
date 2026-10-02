// S11 reduced starter: fail closed until the two defensive decisions are implemented.
import { SAFE_METHODS, normaliseOriginSet } from "./support.js";
export function createReducedSecurityBoundary({trustedOrigins, expectedCsrfToken, compareTokens}) {
  const origins = normaliseOriginSet(trustedOrigins);
  if(typeof expectedCsrfToken!=="string" || expectedCsrfToken.length<16) throw new TypeError("A synthetic fixture token of at least 16 characters is required");
  if(typeof compareTokens!=="function") throw new TypeError("compareTokens is required");
  return Object.freeze({
    corsDecision({origin, method="GET"}={}) {
      return {allowed:false,status:403,code:"cors_not_implemented",headers:{Vary:"Origin"}};
    },
    csrfDecision({method="POST",authMethod="cookie",suppliedToken=""}={}) {
      if(SAFE_METHODS.has(method)||authMethod!=="cookie") return {allowed:true,status:null,code:"csrf_not_required"};
      return {allowed:false,status:403,code:"csrf_not_implemented"};
    }
  });
}
