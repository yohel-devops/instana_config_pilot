const { PresentationFile } = await import('@oai/artifact-tool');
console.log(Object.keys(PresentationFile));
console.log(PresentationFile.exportPptx?.toString().slice(0,200));
