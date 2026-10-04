export function noteQuery(query){
 // TODO: own keys only owner,archived,sort. owner trimmed nonblank string;
 // archived exactly 'true'/'false'; sort 'title_asc'/'id_asc' default id_asc.
 // Return {where:'...' or '',bindings:[],order:'id ASC' or 'title ASC,id ASC'}.
 // WHERE fragments use owner=? / archived=? joined AND; invalid=>TypeError.
 void query;return {where:'',bindings:[],order:'id ASC'};
}
