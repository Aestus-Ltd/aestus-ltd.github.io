// Ordinary PDFs stream through PDF.js. A compressed static asset is expanded
// in the browser, so GitHub Pages needs no PDF proxy or custom response headers.
export async function loadPdfSource(doc,{signal,onProgress}={}){
  const url=new URL(doc.readUrl,import.meta.url).href;
  if(!doc.gzip)return {url};
  const response=await fetch(url,{signal});
  if(!response.ok||!response.body)throw Error('PDF file unavailable ('+response.status+')');
  const total=Number(response.headers.get('content-length'))||0;
  const reader=response.body.getReader(),first=await reader.read();let loaded=0;
  const progress=chunk=>{loaded+=chunk.length;onProgress?.({loaded,total})};
  const stream=new ReadableStream({
    start(controller){if(!first.done){progress(first.value);controller.enqueue(first.value)}else controller.close()},
    async pull(controller){try{const next=await reader.read();if(next.done)controller.close();else{progress(next.value);controller.enqueue(next.value)}}catch(error){controller.error(error)}},
    cancel(reason){return reader.cancel(reason)}
  });
  // Some hosts transparently decompress .gz responses; avoid decoding twice.
  const alreadyPdf=first.value?.[0]===37&&first.value?.[1]===80;
  const decoded=alreadyPdf?stream:stream.pipeThrough(new DecompressionStream('gzip'));
  const data=new Uint8Array(await new Response(decoded).arrayBuffer());
  if(String.fromCharCode(...data.subarray(0,5))!=='%PDF-')throw Error('Invalid PDF data');
  return {data};
}
