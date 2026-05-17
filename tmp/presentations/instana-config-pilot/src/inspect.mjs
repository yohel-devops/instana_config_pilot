const mod = await import('@oai/artifact-tool');
for (const k of ['panel','shape','image','rule']) console.log(k, mod[k]?.toString().slice(0,300));
