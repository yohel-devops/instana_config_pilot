const { Presentation, PresentationFile, layers, panel, column, text, fill, hug, wrap } = await import('@oai/artifact-tool');
const p=Presentation.create({slideSize:{width:1920,height:1080}}); const s=p.slides.add();
s.compose(layers({width:fill,height:fill}, [panel({name:'bg', fill:'#0B1220', width:fill, height:fill}), column({name:'root',width:fill,height:fill,padding:96,gap:24}, [text('Layer Test',{width:wrap(1000),height:hug,style:{fontSize:72,bold:true,color:'#FFFFFF'}})])]), {frame:{left:0,top:0,width:1920,height:1080},baseUnit:8});
const b=await PresentationFile.exportPptx(p); await b.save('output/test-layer.pptx');
const png=await p.export({slide:s,format:'png'}); await png.save('scratch/test-layer.png');
console.log('ok');
