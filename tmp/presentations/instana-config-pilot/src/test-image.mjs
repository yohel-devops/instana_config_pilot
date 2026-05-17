const { Presentation, PresentationFile, column, text, image, fill, hug, wrap } = await import('@oai/artifact-tool');
const presentation = Presentation.create({ slideSize: { width: 1920, height: 1080 } });
const slide = presentation.slides.add();
slide.compose(column({ name:'root', width: fill, height: fill, padding:72, gap:28 }, [
 text('Image Test', { name:'title', width: wrap(1200), height: hug, style:{ fontSize:64, bold:true, color:'#111827' } }),
 image({ name:'app', path:'../../../docs/demo-assets/app-home.png', width: 900, height: 520, fit:'contain', alt:'App home screenshot' })
]), { frame:{left:0, top:0, width:1920, height:1080}, baseUnit:8 });
const pptxBlob = await PresentationFile.exportPptx(presentation);
await pptxBlob.save('output/test-image.pptx');
console.log('saved');
