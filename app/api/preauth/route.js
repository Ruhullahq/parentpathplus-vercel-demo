import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(req){
  const b = await req.json();
  const { state='IL', insurance='Aetna', child={} } = b || {};
  const doc = new PDFDocument({ size:'LETTER', margin: 50 });
  const chunks = [];
  return await new Promise((resolve) => {
    doc.on('data', (c)=> chunks.append?chunks.append(c):chunks.push(c));
    doc.on('end', ()=>{
      const buf = Buffer.concat(chunks);
      resolve(new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="preauth.pdf"'
        }
      }));
    });
    doc.fontSize(18).text('Pre‑Authorization Packet', { underline:true });
    doc.moveDown();
    doc.fontSize(12).text(`State: ${state}`);
    doc.text(`Insurance: ${insurance}`);
    doc.moveDown();
    doc.text('Child:');
    doc.text(`  First: ${child.first||''}`);
    doc.text(`  Last: ${child.last||''}`);
    doc.moveDown();
    doc.text('Checklist:');
    doc.text('  - ABA order from physician');
    doc.text('  - Diagnostic report attached');
    doc.text('  - Treatment plan goals');
    doc.text('  - Parent consent signature');
    doc.end();
  });
}
