const { Presentation } = await import('@oai/artifact-tool');
const p=Presentation.create({slideSize:{width:1920,height:1080}});
console.log(Object.keys(p));
let proto=Object.getPrototypeOf(p); console.log(Object.getOwnPropertyNames(proto));
