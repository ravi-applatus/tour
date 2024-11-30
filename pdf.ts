import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';

export class PDF {
  public doc;
  public RTL;

  constructor(pathFile, RTL = false) {
    this.doc = new PDFDocument({ size: 'A4' });
    this.RTL = RTL;

    const assetsPath = `${__dirname}/../assets`;

    if (RTL) {
      this.doc.registerFont(
        'Iransans',
        path.join(assetsPath, 'fonts/iransans_medium.ttf'),
      );
    } else {
      this.doc.registerFont(
        'Tahoma',
        path.join(assetsPath, 'fonts/tahoma_medium.ttf'),
      );
    }

    // Pipe its output somewhere, like to a file or HTTP response
    this.doc.pipe(fs.createWriteStream(pathFile));
  }

  addImage(pathFile, x, y, width) {
    this.doc.image(pathFile, x, y, { width });
  }

  addText(text, x, y, width, options = null) {
    const {
      size = 9,
      align = 'left',
      direction = 'ltr',
      lineGap,
    } = options || {};

    if ((this.RTL || direction === 'rtl') && text && !/^[0-9]+$/.test(text)) {
      const match = text.match(/\d+/g);
      if (match?.length) {
        match.forEach((number) => {
          text = text.replace(
            new RegExp(number, 'g'),
            number.split('').reverse().join(''),
          );
        });
      }
    }

    if (lineGap) {
      this.doc
        .font(this.RTL ? 'Iransans' : 'Tahoma')
        .fontSize(size)
        .fill('#000000')
        .lineGap(lineGap)
        .text(text || '', x, y, {
          ...((this.RTL || direction === 'rtl') && { features: ['rtla'] }),
          align: this.RTL || direction === 'rtl' ? 'right' : align,
          width,
        });
    } else {
      this.doc
        .font(this.RTL ? 'Iransans' : 'Tahoma')
        .fontSize(size)
        .fill('#000000')
        .text(text || '', x, y, {
          ...((this.RTL || direction === 'rtl') && { features: ['rtla'] }),
          align: this.RTL || direction === 'rtl' ? 'right' : align,
          width,
        });
    }
  }

  addPage() {
    this.doc.addPage();
  }

  end() {
    this.doc.end();
  }
}
