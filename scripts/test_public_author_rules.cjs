const fs=require('fs');
// Pass the installed firebase-tools/lib directory; credentials stay inside the CLI.
const cli=process.argv[2];
if(!cli) throw Error('Usage: node scripts/test_public_author_rules.cjs <firebase-tools/lib directory>');
const {requireAuth}=require(cli+'/requireAuth');
const {getProjectDefaultAccount}=require(cli+'/auth');
const {Client}=require(cli+'/apiv2');
const profile={id:'reporter',name:'Reporter',avatar:'https://example.com/photo.jpg',role:'REPORTER',designation:'Reporter'};
const cases=[];
function add(name,method,auth,data,expected='DENY',collection='public_authors',source=profile){
 cases.push({name,test:{expectation:expected,request:{path:'/databases/(default)/documents/'+collection+'/reporter',method,auth:auth?{uid:auth,token:{}}:null,resource:{data}},resource:{data:profile},functionMocks:[{function:'getAfter',args:[{anyValue:{}}],result:{value:{data:source}}},{function:'get',args:[{anyValue:{}}],result:{value:{data:{role:'REPORTER',status:'ACTIVE'}}}},{function:'exists',args:[{anyValue:{}}],result:{value:true}}]}});
}
add('public read','get',null,profile,'ALLOW');
add('public list','list',null,profile,'ALLOW');
add('private users stay private','get',null,profile,'DENY','users');
add('anonymous create blocked','create',null,profile);
add('own create succeeds','create','reporter',profile,'ALLOW');
add('own update succeeds','update','reporter',profile,'ALLOW');
add('other user write blocked','update','stranger',profile);
add('ownership change blocked','update','reporter',{...profile,id:'stranger'});
add('email injection blocked','create','reporter',{...profile,email:'private@example.com'});
add('role spoof blocked','update','reporter',{...profile,role:'SUPER_ADMIN'});
add('oversize blocked','update','reporter',{...profile,name:'x'.repeat(301)});
add('missing required field blocked','update','reporter',{id:'reporter'});
add('invalid type blocked','update','reporter',{...profile,name:17});
add('invalid image blocked','update','reporter',{...profile,avatar:'javascript:alert(1)'});
add('own delete blocked','delete','reporter',profile);
(async()=>{
 const account=getProjectDefaultAccount(process.cwd());
 await requireAuth({project:'in24-news-platform-6f802',...account,nonInteractive:true});
 const client=new Client({urlPrefix:'https://firebaserules.googleapis.com',apiVersion:'v1'});
 const result=await client.post('/projects/in24-news-platform-6f802:test',{source:{files:[{name:'firestore.rules',content:fs.readFileSync('firestore.rules','utf8')}]},testSuite:{testCases:cases.map(c=>c.test)}},{skipLog:{body:true}});
 const report={issues:result.body.issues,results:(result.body.testResults||[]).map((r,i)=>({name:cases[i].name,...r}))};
 fs.writeFileSync('build/author-check/public-author-rules-results.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({issues:report.issues,results:report.results.map(r=>({name:r.name,state:r.state}))}));
 if(report.results.length!==cases.length||report.results.some(r=>r.state!=='SUCCESS'))process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
