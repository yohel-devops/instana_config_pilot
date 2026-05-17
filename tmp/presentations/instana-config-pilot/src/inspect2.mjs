const {paint, stroke} = await import('@oai/artifact-tool/presentation-jsx');
for (const x of [paint, stroke]) console.log(Object.keys(x), x.toString().slice(0,500));
