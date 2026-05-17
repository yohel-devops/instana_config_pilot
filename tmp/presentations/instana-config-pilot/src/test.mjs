const { Presentation, PresentationFile, column, text, fill, hug, wrap } = await import('@oai/artifact-tool');
const presentation = Presentation.create({ slideSize: { width: 1920, height: 1080 } });
const slide = presentation.slides.add();
slide.compose(column({ name:'root', width: fill, height: fill, padding:72, gap:28 }, [
 text('Test Deck', { name:'title', width: wrap(1200), height: hug, style:{ fontSize:64, bold:true, color:'#111827' } }),
 text('Hello world', { name:'body', width: wrap(900), height: hug, style:{ fontSize:32, color:'#374151' } })
]), { frame:{left:0, top:0, width:1920, height:1080}, baseUnit:8 });
const pptxBlob = await PresentationFile.exportPptx(presentation);
await pptxBlob.save('output/test.pptx');
console.log('saved');
