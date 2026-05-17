const { Presentation } = await import('@oai/artifact-tool');
const p=Presentation.create({slideSize:{width:1920,height:1080}});
console.log(Object.keys(p.slides)); console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides)));
