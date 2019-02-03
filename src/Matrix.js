export class Matrix {
  constructor(cols, rows, fields) {
    let checkSum = cols * rows;

    if (checkSum !== fields.length) {
      throw new Error(`
      Cannot create matrix of inconsistend fields amount: ${fields.length}
      number of fields should equal cols * rows = ${checkSum}
      `);
    }
    this.cols = cols;
    this.rows = rows;

    this.fields = fields;
  }

  getIndex(x, y) {
    if (x > this.cols || x < 0 || y > this.rows || y < 0) {
      return -1;
    }
    return y * this.cols + x;
  }

  getRow(y) {
    return this.fields.slice(this.getIndex(0, y), this.cols - 1);
  }

  getColumn(x) {
    const column = [];

    for (let y = 0; y < this.cols; y++) {
      const fieldNumberHorizontal = this.getIndex(x, y);

      column.push(this.fields[fieldNumberHorizontal]);
    }
    return column;
  }

  rotate90Degree() {
    const fields = [];

    for (let x = 0; x < this.cols; x++) {
      fields.push(...this.getColumn(x).reverse());
    }
    this.fields = fields;
  }
}
